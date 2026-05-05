<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AttendanceController;

// Public routes
Route::apiResource('events', EventController::class)->only(['index', 'show']);

// Protected routes
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

    // Events (protected)
    Route::apiResource('events', EventController::class)->only(['store', 'update', 'destroy']);

    // Attendance
    Route::post('/attendances/check-in', [AttendanceController::class, 'checkIn']);
});