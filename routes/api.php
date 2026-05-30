<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\AuditLogController;

// Public routes
Route::apiResource('events', EventController::class)->only(['index', 'show']);

// Protected routes (semua user login)
Route::middleware('auth:sanctum')->group(function () {

    // User
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

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // Attendance (semua anggota bisa check-in)
    Route::post('/attendances/check-in', [AttendanceController::class, 'checkIn']);
});

    // Protected routes (khusus admin dan super_admin)
    Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {

    // Events - hanya admin yang bisa buat, edit, hapus
    Route::apiResource('events', EventController::class)->only(['store', 'update', 'destroy']);
});

    // Khusus admin dan super_admin
    Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
        Route::apiResource('events', EventController::class)->only(['store', 'update', 'destroy']);

        Route::get('/events/{eventId}/attendances', [AttendanceController::class, 'monitorByEvent']);
        Route::get('/events/{eventId}/attendances/export-csv', [AttendanceController::class, 'exportCsv']);
        
        Route::get('/members', [MemberController::class, 'index']);
        Route::get('/members/{id}', [MemberController::class, 'show']);
        Route::post('/members', [MemberController::class, 'store']);
        Route::post('/members/import', [MemberController::class, 'import']);
        Route::put('/members/{id}', [MemberController::class, 'update']);
        Route::delete('/members/{id}', [MemberController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
});