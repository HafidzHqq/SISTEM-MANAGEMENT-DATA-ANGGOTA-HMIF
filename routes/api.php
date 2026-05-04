<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;

// Endpoint yang butuh login (protected by Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    
    // Return data user yang sedang login beserta profil lengkapnya
    Route::get('/me', function (Request $request) {
        $user = $request->user()->load('memberProfile');
        return response()->json([
            'user_id'   => $user->user_id,
            'name'      => $user->name,
            'email'     => $user->email,
            'nim'       => $user->nim,
            'role'      => $user->role,
            'status'    => $user->status,
            'profile'   => $user->memberProfile,
        ]);
    });

    Route::put('/profile', [ProfileController::class, 'update']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Event routes (protected)
    Route::apiResource('events', EventController::class);
});