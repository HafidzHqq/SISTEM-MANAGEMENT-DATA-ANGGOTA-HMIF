<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Archive;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // Fitur: Check-in Presensi QR
    // Deskripsi: Memvalidasi QR token event dan mencatat presensi anggota.
    public function checkIn(Request $request)
    {
        $validated = $request->validate([
            'qr_token' => 'required|string',
        ]);
        $user = $request->user();

        $event = Event::where('qr_token', $validated['qr_token'])->first();

        if (!$event) {
            return response()->json([
                'message' => 'QR Code tidak valid'
            ], 404);
        }

        $now = Carbon::now();

        if ($enforceWindow && $now->lt($event->attendance_window_start)) {
            return response()->json([
                'message' => 'Presensi belum dibuka'
            ], 403);
        }

        if ($enforceWindow && $now->gt($event->attendance_window_end)) {
            return response()->json([
                'message' => 'Presensi sudah ditutup'
            ], 403);
        }

        $alreadyCheckedIn = Attendance::where('user_id', $user->user_id)
            ->where('event_id', $event->event_id)
            ->exists();

        if ($alreadyCheckedIn) {
            return response()->json([
                'message' => 'Anda sudah melakukan presensi pada event ini'
            ], 409);
        }

        try {
            $attendance = Attendance::create([
                'user_id' => $user->user_id,
                'event_id' => $event->event_id,
                'checkin_time' => Carbon::now(),
                'is_in_radius' => true,
                'status' => 'present',
                'remarks' => 'Check-in melalui QR Code',
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'Anda sudah melakukan presensi pada event ini'
            ], 409);
        }

        return response()->json([
            'message' => 'Presensi berhasil',
            'attendance' => $attendance,
        ], 201);
    }

    public function adminScanCheckIn(Request $request)
    {
        $validated = $request->validate([
            'qr_payload' => 'required|string',
        ]);

        $payload = $this->parseAttendanceQrPayload($validated['qr_payload']);

        if (!$payload || ($payload['type'] ?? null) !== 'hmif_user_attendance') {
            return response()->json(['message' => 'QR user tidak valid'], 422);
        }

        $event = Event::find($payload['event_id'] ?? null);
        $user = User::where('user_id', $payload['user_id'] ?? null)
            ->whereIn('role', ['anggota', 'admin', 'super_admin'])
            ->where('status', 'aktif')
            ->first();

        return $this->recordAdminAttendance($event, $user, 'Check-in dari QR user oleh admin');
    }

    public function manualCheckIn(Request $request)
    {
        $validated = $request->validate([
            'event_id' => 'required|integer|exists:events,event_id',
            'user_id' => 'required|integer|exists:users,user_id',
            'remarks' => 'nullable|string|max:255',
        ]);

        $event = Event::find($validated['event_id']);
        $user = User::where('user_id', $validated['user_id'])
            ->whereIn('role', ['anggota', 'admin', 'super_admin'])
            ->where('status', 'aktif')
            ->first();

        return $this->recordAdminAttendance(
            $event,
            $user,
            $validated['remarks'] ?? 'Set hadir manual oleh admin',
            false
        );
    }

    private function recordAdminAttendance(?Event $event, ?User $user, string $remarks, bool $enforceWindow = true)
    {
        if (!$event) {
            return response()->json(['message' => 'Acara tidak ditemukan'], 404);
        }

        if (!$user) {
            return response()->json(['message' => 'Anggota tidak ditemukan atau tidak aktif'], 404);
        }

        $now = Carbon::now();

        if ($enforceWindow && $now->lt($event->attendance_window_start)) {
            return response()->json(['message' => 'Presensi belum dibuka'], 403);
        }

        if ($enforceWindow && $now->gt($event->attendance_window_end)) {
            return response()->json(['message' => 'Presensi sudah ditutup'], 403);
        }

        $alreadyCheckedIn = Attendance::where('user_id', $user->user_id)
            ->where('event_id', $event->event_id)
            ->exists();

        if ($alreadyCheckedIn) {
            return response()->json([
                'message' => $user->name . ' sudah tercatat hadir pada acara ini'
            ], 409);
        }

        try {
            $attendance = Attendance::create([
                'user_id' => $user->user_id,
                'event_id' => $event->event_id,
                'checkin_time' => $now,
                'is_in_radius' => true,
                'status' => 'present',
                'remarks' => $remarks,
            ]);
            $actorId = request()->user()?->user_id;
            if ($actorId) {
                $details = "Melakukan check-in manual untuk {$user->name} pada acara {$event->title}";
                \App\Models\AuditLog::catat($actorId, 'manual_checkin', 'attendance', $attendance->attendance_id, $details);
            }
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => $user->name . ' sudah tercatat hadir pada acara ini'
            ], 409);
        }

        return response()->json([
            'message' => $user->name . ' berhasil diset hadir untuk ' . $event->title,
            'attendance' => $attendance,
        ], 201);
    }

    private function parseAttendanceQrPayload(string $payload): ?array
    {
        $payload = trim($payload);
        $decoded = json_decode($payload, true);

        if (is_array($decoded)) {
            return $decoded;
        }

        $query = parse_url($payload, PHP_URL_QUERY);
        if ($query) {
            parse_str($query, $params);
            if (isset($params['attendance'])) {
                $decoded = json_decode($params['attendance'], true);
                return is_array($decoded) ? $decoded : null;
            }
        }

        return null;
    }

    // Fitur: Export CSV Kehadiran Event
    // Deskripsi: Mengunduh rekap kehadiran anggota pada event tertentu dalam format CSV.
    public function exportCsv($eventId)
    {
        $event = Event::find($eventId);

        if (!$event) {
            return response()->json([
                'message' => 'Event tidak ditemukan'
            ], 404);
        }

        $departmentColumn = $this->departmentColumn();
        $rows = $this->attendanceReportRows($event, $departmentColumn);
        $fileName = 'rekap-kehadiran-event-' . $event->event_id . '.csv';

        return new StreamedResponse(function () use ($rows) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'No',
                'Nama',
                'NIM',
                'Departemen',
                'Jabatan',
                'Status Keanggotaan',
                'Waktu Check-in',
                'Status',
                'Validasi Radius',
                'Keterangan',
            ]);

            foreach ($rows as $index => $row) {
                fputcsv($handle, [
                    $index + 1,
                    $this->sanitizeCsvValue($row['name']),
                    $this->sanitizeCsvValue($row['nim']),
                    $this->sanitizeCsvValue($row['departemen']),
                    $this->sanitizeCsvValue($row['jabatan']),
                    $this->sanitizeCsvValue($row['status_keanggotaan']),
                    $row['checkin_time'],
                    $this->sanitizeCsvValue($row['status'] === 'present' ? 'HADIR' : 'TIDAK HADIR'),
                    $row['is_in_radius'] === null ? '-' : ($row['is_in_radius'] ? 'Valid' : 'Tidak Valid'),
                    $this->sanitizeCsvValue($row['remarks']),
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }

    // Fitur: Monitoring Kehadiran Event
    // Deskripsi: Menampilkan daftar kehadiran anggota pada event tertentu untuk dashboard admin.
    public function monitorByEvent(Request $request, $eventId)
    {
        $validated = $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:1000',
            'page' => 'sometimes|integer|min:1',
        ]);

        $perPage = $validated['per_page'] ?? 20;
        $page = $validated['page'] ?? 1;

        try {
            $event = Event::find($eventId);

            if (!$event) {
                return response()->json([
                    'message' => 'Event tidak ditemukan'
                ], 404);
            }

            $departmentColumn = $this->departmentColumn();
            $rows = $this->attendanceReportRows($event, $departmentColumn);

            $total = count($rows);
            $lastPage = max(1, (int) ceil($total / $perPage));
            $page = min($page, $lastPage);
            $offset = ($page - 1) * $perPage;
            $pagedRows = array_slice($rows, $offset, $perPage);

            $totalPresent = count(array_filter($rows, fn ($row) => $row['status'] === 'present'));
            $totalAbsent = $total - $totalPresent;
            $totalInRadius = count(array_filter($rows, fn ($row) => $row['is_in_radius'] === true));
            $totalOutRadius = count(array_filter($rows, fn ($row) => $row['is_in_radius'] === false));

            return response()->json([
                'event' => [
                    'event_id' => $event->event_id,
                    'title' => $event->title,
                    'date_time' => $event->date_time,
                    'attendance_window_start' => $event->attendance_window_start,
                    'attendance_window_end' => $event->attendance_window_end,
                ],
                'summary' => [
                    'total_present' => $totalPresent,
                    'total_absent' => $totalAbsent,
                    'total_members' => $total,
                    'total_in_radius' => $totalInRadius,
                    'total_out_radius' => $totalOutRadius,
                ],
                'attendances' => $pagedRows,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => $lastPage,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Gagal memuat monitoring kehadiran', [
                'event_id' => $eventId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal memuat monitoring kehadiran'
            ], 500);
        }
    }

    private function attendanceReportRows(Event $event, string $departmentColumn): array
    {
        $attendances = Attendance::where('event_id', $event->event_id)
            ->with(['user:user_id,name,nim'])
            ->get()
            ->keyBy('user_id');

        return User::with("memberProfile:profile_id,user_id,{$departmentColumn},jabatan,status_keanggotaan")
            ->whereIn('role', ['anggota', 'admin', 'super_admin'])
            ->where('status', 'aktif')
            ->orderBy('name')
            ->get(['user_id', 'name', 'nim'])
            ->map(function ($user) use ($attendances, $departmentColumn) {
                $attendance = $attendances->get($user->user_id);
                $profile = $user->memberProfile;

                return [
                    'attendance_id' => $attendance?->attendance_id,
                    'user_id' => $user->user_id,
                    'name' => $user->name,
                    'nim' => $user->nim,
                    'departemen' => $profile?->getAttribute($departmentColumn),
                    'jabatan' => $profile?->jabatan,
                    'status_keanggotaan' => $profile?->status_keanggotaan,
                    'checkin_time' => $attendance?->checkin_time,
                    'status' => $attendance ? $attendance->status : 'absent',
                    'is_in_radius' => $attendance ? (bool) $attendance->is_in_radius : null,
                    'remarks' => $attendance?->remarks ?? 'Belum melakukan presensi',
                ];
            })
            ->all();
    }

    private function departmentColumn(): string
    {
        return Schema::hasColumn('member_profiles', 'departemen') ? 'departemen' : 'Departemen';
    }

    private function sanitizeCsvValue($value)
    {
        if ($value === null) {
            return null;
        }

        $value = (string) $value;

        if (preg_match('/^\s*[=+\-@]/', $value)) {
            return "'" . $value;
        }

        return $value;
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // meter

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(
            pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)
        ));

        return $earthRadius * $angle;
    }

    // Fitur: Riwayat Presensi Anggota
// Deskripsi: Menampilkan riwayat kehadiran user yang sedang login
public function myHistory(Request $request)
{
    $user = $request->user();

    $attendances = Attendance::with(['event', 'archive'])
        ->where('user_id', $user->user_id)
        ->orderByDesc('checkin_time')
        ->get()
        ->map(function ($attendance) {
            $event = $attendance->event;
            $eventDate = $event?->date_time ? Carbon::parse($event->date_time) : null;
            $checkinTime = $attendance->checkin_time ? Carbon::parse($attendance->checkin_time) : null;
            $eventTimeLabel = $eventDate ? $eventDate->format('H:i') . ' WIB' : null;
            $checkinTimeLabel = $checkinTime ? $checkinTime->format('H:i') . ' WIB' : null;

            return [
                'attendance_id' => $attendance->attendance_id,
                'event_id'      => $event?->event_id,
                'event_name'    => $event?->title,
                'description'   => $event?->description,
                'location'      => $this->eventLocation($event),
                'date'          => $eventDate?->format('d M Y') ?? $checkinTime?->format('d M Y'),
                'time'          => $eventTimeLabel ?? $checkinTimeLabel,
                'checkin_time'  => $checkinTimeLabel,
                'method'        => $attendance->method ?? 'QR Scan',
                'status'        => $attendance->status === 'present' ? 'hadir' : 'tidak_hadir',
                'is_archived'   => (bool) $attendance->archive,
                'archived_at'   => $attendance->archive?->archived_at,
            ];
        });

    return response()->json($attendances);
}

public function archiveOldForUser(Request $request)
{
    $validated = $request->validate([
        'days' => 'sometimes|integer|min:1|max:365',
    ]);

    $user = $request->user();
    $days = $validated['days'] ?? 30;
    $cutoff = now()->subDays($days);

    $query = Attendance::where('user_id', $user->user_id)
        ->where(function ($query) use ($cutoff) {
            $query->whereHas('event', function ($eventQuery) use ($cutoff) {
                $eventQuery->where('attendance_window_end', '<', $cutoff);
            })->orWhere(function ($fallbackQuery) use ($cutoff) {
                $fallbackQuery
                    ->whereDoesntHave('event')
                    ->where('checkin_time', '<', $cutoff);
            });
        })
        ->whereDoesntHave('archive');

    $candidateCount = $query->count();
    $archivedCount = 0;

    $query->chunkById(100, function ($attendances) use (&$archivedCount) {
        foreach ($attendances as $attendance) {
            Archive::firstOrCreate(
                ['attendance_id' => $attendance->attendance_id],
                ['archived_at' => now()]
            );

            $archivedCount++;
        }
    }, 'attendance_id');

    return response()->json([
        'message' => $archivedCount > 0
            ? "Berhasil mengarsipkan {$archivedCount} log lama."
            : "Tidak ada log lama yang perlu diarsipkan.",
        'archived_count' => $archivedCount,
        'candidate_count' => $candidateCount,
        'days' => $days,
    ]);
}

private function eventLocation($event): ?string
{
    if (!$event) {
        return null;
    }

    foreach (['location_name', 'location', 'venue', 'place', 'room'] as $field) {
        $value = $event->getAttribute($field);

        if (!empty($value)) {
            return $value;
        }
    }

    return null;
}
}
