<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    // Ambil semua event
    public function index()
    {
        $events = Event::all();
        return response()->json($events);
    }

    // Tambah event baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'                    => 'required|string',
            'description'              => 'nullable|string',
            'date_time'                => 'required|date',
            'attendance_window_start'  => 'required|date',
            'attendance_window_end'    => 'required|date',
            'qr_token'                 => 'required|string|unique:events',
            'latitude_center'          => 'nullable|numeric',
            'longitude_center'         => 'nullable|numeric',
            'radius_meter'             => 'nullable|integer',
            'created_by'               => 'required|exists:users,user_id',
        ]);

        $event = Event::create($validated);
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
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        $event->update($request->all());
        return response()->json($event);
    }

    // Hapus event
    public function destroy($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        $event->delete();
        return response()->json(['message' => 'Event berhasil dihapus']);
    }
}