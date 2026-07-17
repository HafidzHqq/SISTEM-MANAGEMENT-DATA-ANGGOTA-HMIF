<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// Setup route untuk Hostinger (memperbaiki gambar tidak terload)
Route::get('/setup-hostinger', function () {
    try {
        // Hapus symlink lama jika ada
        if (file_exists(public_path('storage'))) {
            unlink(public_path('storage'));
        }
        
        \Illuminate\Support\Facades\Artisan::call('storage:link');
        $output = \Illuminate\Support\Facades\Artisan::output();
        return "Berhasil: " . $output;
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

// Login page
Route::get('/login', function () {
    return view('welcome');
})->name('login');

// Google OAuth
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Dev Login (Local Only)
Route::get('/dev-login/{role?}', [AuthController::class, 'devLogin']);

// Logout
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Dashboard
    Route::get('/dashboard', function () {
        return view('welcome');
    })->name('dashboard');


Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');