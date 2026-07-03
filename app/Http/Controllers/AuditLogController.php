<?php

namespace App\Http\Controllers;

// Fitur: Audit Log
// Deskripsi: Mencatat setiap perubahan data yang dilakukan admin dan menampilkannya ke super_admin

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    // GET /api/audit-logs — ambil semua log aktivitas
    public function index(Request $request)
    {
        $query = AuditLog::with('actor')
            ->orderBy('created_at', 'desc');

        // Filter by actor (admin tertentu)
        if ($request->has('actor_id') && $request->actor_id !== '') {
            $query->where('actor_id', $request->actor_id);
        }

        // Filter by jenis aksi
        if ($request->has('action') && $request->action !== '') {
            $query->where('action', $request->action);
        }

        $logs = $query->get();

        // Dynamically map target name/title in batch
        $userIds = $logs->whereIn('target_type', ['user', 'member'])->pluck('target_id')->unique();
        $eventIds = $logs->where('target_type', 'event')->pluck('target_id')->unique();
        $attendanceIds = $logs->where('target_type', 'attendance')->pluck('target_id')->unique();

        $users = \App\Models\User::whereIn('user_id', $userIds)->get()->keyBy('user_id');
        $events = \App\Models\Event::whereIn('event_id', $eventIds)->get()->keyBy('event_id');
        $attendances = \App\Models\Attendance::with(['user', 'event'])->whereIn('attendance_id', $attendanceIds)->get()->keyBy('attendance_id');

        $logs->each(function ($log) use ($users, $events, $attendances) {
            $log->target_name = null;
            if ($log->target_type === 'user' || $log->target_type === 'member') {
                if (isset($users[$log->target_id])) {
                    $log->target_name = $users[$log->target_id]->name;
                }
            } elseif ($log->target_type === 'event') {
                if (isset($events[$log->target_id])) {
                    $log->target_name = $events[$log->target_id]->title;
                }
            } elseif ($log->target_type === 'attendance') {
                if (isset($attendances[$log->target_id])) {
                    $att = $attendances[$log->target_id];
                    $userName = $att->user?->name ?? 'User';
                    $eventTitle = $att->event?->title ?? 'Acara';
                    $log->target_name = "$userName ({$eventTitle})";
                }
            }
        });

        return response()->json($logs);
    }
}