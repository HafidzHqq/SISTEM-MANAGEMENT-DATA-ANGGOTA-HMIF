<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Event;
use Illuminate\Http\Request;
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
