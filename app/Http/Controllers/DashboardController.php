<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Event;
use App\Models\Attendance;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function attendanceStatistics()
    {
        $eligibleUserIds = User::whereIn('role', ['anggota', 'admin'])
            ->where('status', 'aktif')
            ->pluck('user_id');

        $totalMembers = User::where('role', 'anggota')->where('status', 'aktif')->count();
        $totalAdmins = User::where('role', 'admin')->where('status', 'aktif')->count();
        $totalAttendanceParticipants = $eligibleUserIds->count();
        $totalEvents = Event::count();
        $activeEvents = Event::where('date_time', '>=', now())->count();
        $eventsThisMonth = Event::whereYear('date_time', now()->year)
            ->whereMonth('date_time', now()->month)
            ->count();

        $presentAttendancesQuery = Attendance::where('status', 'present')
            ->whereIn('user_id', $eligibleUserIds);
        $uniquePresentExpression = "attendances.user_id || '-' || attendances.event_id";

        $totalAttendances = (clone $presentAttendancesQuery)
            ->get(['user_id', 'event_id'])
            ->unique(function ($attendance) {
                return $attendance->user_id . '-' . $attendance->event_id;
            })
            ->count();
        $todayAttendances = (clone $presentAttendancesQuery)
            ->whereDate('checkin_time', now()->toDateString())
            ->get(['user_id', 'event_id'])
            ->unique(function ($attendance) {
                return $attendance->user_id . '-' . $attendance->event_id;
            })
            ->count();
        $totalValidRadius = (clone $presentAttendancesQuery)->where('is_in_radius', true)->count();
        $totalInvalidRadius = (clone $presentAttendancesQuery)->where('is_in_radius', false)->count();

        $attendanceCapacity = $totalAttendanceParticipants * $totalEvents;
        $totalAbsences = max($attendanceCapacity - $totalAttendances, 0);

        $attendanceRate = $attendanceCapacity > 0
            ? round(($totalAttendances / $attendanceCapacity) * 100, 2)
            : 0;

        $radiusValidation = [
            'valid' => $totalValidRadius,
            'invalid' => $totalInvalidRadius,
        ];

        $departmentColumn = Schema::hasColumn('member_profiles', 'departemen')
            ? 'departemen'
            : 'Departemen';

        $attendanceByDepartment = Attendance::query()
            ->join('users', 'attendances.user_id', '=', 'users.user_id')
            ->leftJoin('member_profiles', 'users.user_id', '=', 'member_profiles.user_id')
            ->where('attendances.status', 'present')
            ->whereIn('attendances.user_id', $eligibleUserIds)
            ->whereIn('users.role', ['anggota', 'admin'])
            ->where('users.status', 'aktif')
            ->select(
                "member_profiles.{$departmentColumn} as departemen",
                DB::raw("COUNT(DISTINCT {$uniquePresentExpression}) as total_present")
            )
            ->groupBy("member_profiles.{$departmentColumn}")
            ->orderByDesc('total_present')
            ->get()
            ->map(function ($item) {
                $item->departemen = $item->departemen ?: 'Belum Ditentukan';
                return $item;
            });

        $attendanceByGeneration = Attendance::where('status', 'present')
            ->whereIn('user_id', $eligibleUserIds)
            ->with('user.memberProfile')
            ->get()
            ->groupBy(function ($attendance) {
                return $attendance->user?->memberProfile?->angkatan ?? 'Tidak Ada Angkatan';
            })
            ->map(function ($items, $angkatan) {
                return [
                    'angkatan' => $angkatan,
                    'total_present' => $items->unique(function ($attendance) {
                        return $attendance->user_id . '-' . $attendance->event_id;
                    })->count(),
                ];
            })
            ->values();

        $attendanceTrendByEvent = Event::orderBy('date_time')
            ->get()
            ->map(function ($event) use ($eligibleUserIds) {
                return [
                    'event_id' => $event->event_id,
                    'title' => $event->title,
                    'date_time' => $event->date_time,
                    'total_present' => Attendance::where('event_id', $event->event_id)
                        ->where('status', 'present')
                        ->whereIn('user_id', $eligibleUserIds)
                        ->distinct('user_id')
                        ->count('user_id'),
                ];
            });

        $recentAttendances = Attendance::where('status', 'present')
            ->whereIn('user_id', $eligibleUserIds)
            ->with([
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
                'total_attendance_participants' => $totalAttendanceParticipants,
                'total_events' => $totalEvents,
                'active_events' => $activeEvents,
                'events_this_month' => $eventsThisMonth,
                'total_attendances' => $totalAttendances,
                'today_attendances' => $todayAttendances,
                'total_absences' => $totalAbsences,
                'attendance_capacity' => $attendanceCapacity,
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
