<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    // Ambil semua event
    public function index()
    {
        $events = Event::withCount('attendances')->get();
        return response()->json($events);
    }

    // Tambah event baru
    public function store(Request $request)
    {
        if (!$this->isAdmin($request)) {
            return $this->forbiddenResponse();
        }

        $validated = $request->validate([
            'title'                    => 'required|string',
            'description'              => 'nullable|string',
            'location'                => 'nullable|string',
            'date_time'                => 'required|date',
            'attendance_window_start'  => 'required|date',
            'attendance_window_end'    => 'required|date',
            'latitude_center'          => 'nullable|numeric',
            'longitude_center'         => 'nullable|numeric',
            'radius_meter'             => 'nullable|integer',
        ]);

        $validated['qr_token'] = Str::random(64);
        $validated['created_by'] = $request->user()->user_id;

        $event = Event::create($validated);
        $details = "Membuat acara baru: {$event->title} di " . ($event->location ?: 'Lokasi belum ditentukan');
        \App\Models\AuditLog::catat($request->user()->user_id, 'store', 'event', $event->event_id, $details);
        return response()->json($event, 201);
    }

    // Ambil satu event berdasarkan ID
    public function show($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        return response()->json($event);
    }

    // Update event
    public function update(Request $request, $id)
    {
        if (!$this->isAdmin($request)) {
            return $this->forbiddenResponse();
        }

        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'title'                    => 'sometimes|required|string',
            'description'              => 'nullable|string',
            'location'                 => 'nullable|string',
            'date_time'                => 'sometimes|required|date',
            'attendance_window_start'  => 'sometimes|required|date',
            'attendance_window_end'    => 'sometimes|required|date',
            'latitude_center'          => 'nullable|numeric',
            'longitude_center'         => 'nullable|numeric',
            'radius_meter'             => 'nullable|integer',
        ]);

        $dirty = [];
        foreach ($validated as $key => $value) {
            if ($event->$key != $value) {
                $dirty[$key] = [
                    'old' => $event->$key ?? 'Belum Diatur',
                    'new' => $value ?? 'Belum Diatur',
                ];
            }
        }

        $event->update($validated);

        $detailsList = [];
        foreach ($dirty as $field => $change) {
            $fieldName = match($field) {
                'title' => 'Judul',
                'description' => 'Deskripsi',
                'location' => 'Lokasi',
                'date_time' => 'Jam Acara',
                'attendance_window_start' => 'Mulai Presensi',
                'attendance_window_end' => 'Tutup Presensi',
                default => $field,
            };
            $detailsList[] = "$fieldName: \"{$change['old']}\" -> \"{$change['new']}\"";
        }
        $details = implode(', ', $detailsList);

        \App\Models\AuditLog::catat($request->user()->user_id, 'update', 'event', $event->event_id, $details ?: 'Tidak ada perubahan data');

        return response()->json($event);
    }

    // Hapus event
    public function destroy(Request $request, $id)
    {
        if (!$this->isAdmin($request)) {
            return $this->forbiddenResponse();
        }

        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        $details = "Menghapus acara: {$event->title}";
        $event->delete();
        \App\Models\AuditLog::catat($request->user()->user_id, 'delete', 'event', $id, $details);
        return response()->json(['message' => 'Event berhasil dihapus']);
    }

    private function isAdmin(Request $request): bool
    {
        $user = $request->user();

        return $user && in_array($user->role, ['admin', 'super_admin'], true);
    }

    private function forbiddenResponse()
    {
        return response()->json([
            'message' => 'Anda tidak memiliki akses untuk mengelola event'
        ], 403);
    }
}
