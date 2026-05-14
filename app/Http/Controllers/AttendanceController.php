<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // Fitur: Check-in Presensi QR
    // Deskripsi: Memvalidasi QR token event dan mencatat presensi anggota.
    public function checkIn(Request $request)
    {
        $validated = $request->validate([
            'qr_token' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $user = $request->user();

        $event = Event::where('qr_token', $validated['qr_token'])->first();

        if (!$event) {
            return response()->json([
                'message' => 'QR Code tidak valid'
            ], 404);
        }

        $now = Carbon::now();

        if ($now->lt($event->attendance_window_start)) {
            return response()->json([
                'message' => 'Presensi belum dibuka'
            ], 403);
        }

        if ($now->gt($event->attendance_window_end)) {
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

        if (
            is_null($event->latitude_center) ||
            is_null($event->longitude_center) ||
            is_null($event->radius_meter)
        ) {
            return response()->json([
                'message' => 'Lokasi presensi event belum diatur'
            ], 422);
        }

        $distance = $this->calculateDistance(
            $validated['latitude'],
            $validated['longitude'],
            $event->latitude_center,
            $event->longitude_center
        );

        if ($distance > $event->radius_meter) {
            return response()->json([
                'message' => 'Anda berada di luar radius presensi',
                'distance_meter' => round($distance, 2),
                'allowed_radius_meter' => $event->radius_meter
            ], 403);
        }

        try {
            $attendance = Attendance::create([
                'user_id' => $user->user_id,
                'event_id' => $event->event_id,
                'checkin_time' => Carbon::now(),
                'user_latitude' => $validated['latitude'],
                'user_longitude' => $validated['longitude'],
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
            'distance_meter' => round($distance, 2)
        ], 201);
    }

    // Fitur: Monitoring Kehadiran Event
    // Deskripsi: Menampilkan daftar kehadiran anggota pada event tertentu untuk dashboard admin.
    public function monitorByEvent(Request $request, $eventId)
    {
        $validated = $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $perPage = $validated['per_page'] ?? 20;

        try {
            $event = Event::find($eventId);

            if (!$event) {
                return response()->json([
                    'message' => 'Event tidak ditemukan'
                ], 404);
            }

            $baseQuery = Attendance::where('event_id', $event->event_id);

            $totalPresent = (clone $baseQuery)->count();
            $totalInRadius = (clone $baseQuery)->where('is_in_radius', true)->count();
            $totalOutRadius = (clone $baseQuery)->where('is_in_radius', false)->count();

            $attendances = (clone $baseQuery)
                ->with([
                    'user:user_id,name,nim',
                    'user.memberProfile:profile_id,user_id,Departemen,jabatan,status_keanggotaan',
                ])
                ->orderByDesc('checkin_time')
                ->paginate($perPage);

            $attendanceData = $attendances->getCollection()->map(function ($attendance) {
                $user = $attendance->user;
                $profile = $user?->memberProfile;

                return [
                    'attendance_id' => $attendance->attendance_id,
                    'user_id' => $user?->user_id,
                    'name' => $user?->name,
                    'nim' => $user?->nim,
                    'departemen' => $profile?->getAttribute('Departemen'),
                    'jabatan' => $profile?->jabatan,
                    'status_keanggotaan' => $profile?->status_keanggotaan,
                    'checkin_time' => $attendance->checkin_time,
                    'status' => $attendance->status,
                    'is_in_radius' => (bool) $attendance->is_in_radius,
                    'remarks' => $attendance->remarks,
                ];
            });

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
                    'total_in_radius' => $totalInRadius,
                    'total_out_radius' => $totalOutRadius,
                ],
                'attendances' => $attendanceData,
                'pagination' => [
                    'current_page' => $attendances->currentPage(),
                    'per_page' => $attendances->perPage(),
                    'total' => $attendances->total(),
                    'last_page' => $attendances->lastPage(),
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

}
