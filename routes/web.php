<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// Login page
Route::get('/login', function () {
    return view('welcome');
})->name('login');

// Google OAuth
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Logout
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Dashboard
    Route::get('/dashboard', function () {
        return view('welcome');
    })->name('dashboard');


Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');