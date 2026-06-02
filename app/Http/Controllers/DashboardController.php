<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Event;
use App\Models\Attendance;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function attendanceStatistics()
    {
        $totalMembers = User::where('role', 'anggota')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        $totalEvents = Event::count();

        $totalAttendances = Attendance::count();
        $totalValidRadius = Attendance::where('is_in_radius', true)->count();
        $totalInvalidRadius = Attendance::where('is_in_radius', false)->count();

        $attendanceCapacity = $totalMembers * $totalEvents;

        $attendanceRate = $attendanceCapacity > 0
            ? round(($totalAttendances / $attendanceCapacity) * 100, 2)
            : 0;

        $radiusValidation = [
            'valid' => $totalValidRadius,
            'invalid' => $totalInvalidRadius,
        ];

        $attendanceByDepartment = Attendance::query()
            ->join('users', 'attendances.user_id', '=', 'users.user_id')
            ->leftJoin('member_profiles', 'users.user_id', '=', 'member_profiles.user_id')
            ->select(
                'member_profiles.Departemen as departemen',
                DB::raw('COUNT(*) as total_present')
            )
            ->groupBy('member_profiles.Departemen')
            ->orderByDesc('total_present')
            ->get();
        
        $attendanceByGeneration = Attendance::with('user.memberProfile')
            ->get()
            ->groupBy(function ($attendance) {
                return $attendance->user?->memberProfile?->angkatan ?? 'Tidak Ada Angkatan';
            })
            ->map(function ($items, $angkatan) {
                return [
                    'angkatan' => $angkatan,
                    'total_present' => $items->count(),
                ];
            })
            ->values();

        $attendanceTrendByEvent = Event::withCount('attendances')
        ->orderBy('date_time')
        ->get()
        ->map(function ($event) {
            return [
                'event_id' => $event->event_id,
                'title' => $event->title,
                'date_time' => $event->date_time,
                'total_present' => $event->attendances_count,
            ];
        });

        $recentAttendances = Attendance::with([
        'user:user_id,name,nim',
        'event:event_id,title',
        ])
        ->orderByDesc('checkin_time')
        ->limit(5)
        ->get()
        ->map(function ($attendance) {
            return [
                'attendance_id' => $attendance->attendance_id,
                'name' => $attendance->user?->name,
                'nim' => $attendance->user?->nim,
                'event_title' => $attendance->event?->title,
                'checkin_time' => $attendance->checkin_time,
                'is_in_radius' => (bool) $attendance->is_in_radius,
                'status' => $attendance->status,
            ];
        });

        return response()->json([
            'summary' => [
                'total_members' => $totalMembers,
                'total_admins' => $totalAdmins,
                'total_events' => $totalEvents,
                'total_attendances' => $totalAttendances,
                'total_valid_radius' => $totalValidRadius,
                'total_invalid_radius' => $totalInvalidRadius,
                'attendance_rate' => $attendanceRate,
            ],
            'charts' => [
                'radius_validation' => $radiusValidation,
                'attendance_by_department' => $attendanceByDepartment,
                'attendance_by_generation' => $attendanceByGeneration,
                'attendance_trend_by_event' => $attendanceTrendByEvent,
            ],
            'recent_attendances' => $recentAttendances,
        ]);
    }
}
