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
        $eligibleUserIds = User::whereIn('role', ['anggota', 'admin', 'super_admin'])
            ->where('status', 'aktif')
            ->pluck('user_id');

        $totalMembers = User::whereIn('role', ['anggota', 'admin', 'super_admin'])->where('status', 'aktif')->count();
        $totalAdmins = User::whereIn('role', ['admin', 'super_admin'])->where('status', 'aktif')->count();
        $totalAttendanceParticipants = $eligibleUserIds->count();
        $totalEvents = Event::where(function($query) {
            $query->where('date_time', '<=', now())
                  ->orWhere('attendance_window_start', '<=', now());
        })->count();
        $activeEvents = Event::where('date_time', '>=', now())->count();
        $eventsThisMonth = Event::whereYear('date_time', now()->year)
            ->whereMonth('date_time', now()->month)
            ->count();

        $presentAttendancesQuery = Attendance::where('status', 'present')
            ->whereIn('user_id', $eligibleUserIds);

        $driver = DB::connection()->getDriverName();
        $uniquePresentExpression = $driver === 'mysql'
            ? "CONCAT(attendances.user_id, '-', attendances.event_id)"
            : "attendances.user_id || '-' || attendances.event_id";

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

        $departments = User::query()
            ->leftJoin('member_profiles', 'users.user_id', '=', 'member_profiles.user_id')
            ->whereIn('users.role', ['anggota', 'admin', 'super_admin'])
            ->where('users.status', 'aktif')
            ->select(
                "member_profiles.{$departmentColumn} as departemen",
                DB::raw("COUNT(users.user_id) as total_members")
            )
            ->groupBy("member_profiles.{$departmentColumn}")
            ->get()
            ->map(function ($item) {
                $item->departemen = $item->departemen ?: 'Belum Ditentukan';
                return $item;
            });

        $presentsByDept = Attendance::query()
            ->join('users', 'attendances.user_id', '=', 'users.user_id')
            ->leftJoin('member_profiles', 'users.user_id', '=', 'member_profiles.user_id')
            ->where('attendances.status', 'present')
            ->whereIn('attendances.user_id', $eligibleUserIds)
            ->whereIn('users.role', ['anggota', 'admin', 'super_admin'])
            ->where('users.status', 'aktif')
            ->select(
                "member_profiles.{$departmentColumn} as departemen",
                DB::raw("COUNT(DISTINCT {$uniquePresentExpression}) as total_present")
            )
            ->groupBy("member_profiles.{$departmentColumn}")
            ->get()
            ->pluck('total_present', 'departemen')
            ->mapWithKeys(function ($value, $key) {
                return [$key ?: 'Belum Ditentukan' => $value];
            });

        $attendanceByDepartment = $departments->map(function ($dept) use ($presentsByDept, $totalEvents) {
            $totalPresent = $presentsByDept->get($dept->departemen, 0);
            $capacity = $dept->total_members * $totalEvents;
            $rate = $capacity > 0 ? round(($totalPresent / $capacity) * 100, 2) : 0;

            return [
                'departemen' => $dept->departemen,
                'total_members' => $dept->total_members,
                'total_present' => $totalPresent,
                'attendance_rate' => $rate,
            ];
        })->sortByDesc('attendance_rate')->values();

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

        $attendanceTrendByEvent = Event::where(function($query) {
                $query->where('date_time', '<=', now())
                      ->orWhere('attendance_window_start', '<=', now());
            })
            ->orderBy('date_time')
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
