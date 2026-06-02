<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\DashboardController;

// Public routes
Route::apiResource('events', EventController::class)->only(['index', 'show']);

// Protected routes (semua user login)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', function (Request $request) {
        $user = $request->user()->load('memberProfile');

        return response()->json([
            'user_id' => $user->user_id,
            'name'    => $user->name,
            'email'   => $user->email,
            'nim'     => $user->nim,
            'role'    => $user->role,
            'status'  => $user->status,
            'profile' => $user->memberProfile,
        ]);
    });

    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/attendances/check-in', [AttendanceController::class, 'checkIn']);
});

// Protected routes (khusus admin dan super_admin)
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
    Route::apiResource('events', EventController::class)->only(['store', 'update', 'destroy']);

    Route::get('/events/{eventId}/attendances', [AttendanceController::class, 'monitorByEvent']);
    Route::get('/events/{eventId}/attendances/export-csv', [AttendanceController::class, 'exportCsv']);
    Route::get('/dashboard/attendance-statistics', [DashboardController::class, 'attendanceStatistics']);

    Route::get('/members', [MemberController::class, 'index']);
    Route::get('/members/{id}', [MemberController::class, 'show']);
    Route::post('/members', [MemberController::class, 'store']);
    Route::post('/members/import', [MemberController::class, 'import']);
    Route::put('/members/{id}', [MemberController::class, 'update']);
    Route::delete('/members/{id}', [MemberController::class, 'destroy']);
});

// Protected routes (khusus super_admin)
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/audit-logs', [AuditLogController::class, 'index']);

    Route::get('/admins', [SuperAdminController::class, 'index']);
    Route::post('/admins/{id}/promote', [SuperAdminController::class, 'promote']);
    Route::post('/admins/{id}/demote', [SuperAdminController::class, 'demote']);
    Route::patch('/admins/{id}/status', [SuperAdminController::class, 'toggleStatus']);
    Route::delete('/admins/{id}', [SuperAdminController::class, 'destroy']);
});