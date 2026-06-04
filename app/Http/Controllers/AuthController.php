<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    // Redirect ke halaman login Google
    public function redirectToGoogle()
    {
    return Socialite::driver('google')
    ->stateless()
    ->with(['hd' => 'student.itera.ac.id', 'prompt' => 'select_account'])
    ->redirect();
    }

    // Handle callback dari Google setelah user login
    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $email = $googleUser->getEmail();
        if (!str_ends_with($email, '@student.itera.ac.id')) {
            return redirect(env('FRONTEND_URL') . '/login?error=domain_tidak_valid');
        }

        // Extract NIM dari email
        $nimPart = explode('@', $email)[0];
        $nim = explode('.', $nimPart)[1];

        // Validasi format NIM
        $nimDigits = preg_replace('/\D/', '', $nim);

        // Cek jenjang (digit 1 = sarjana)
        if (substr($nimDigits, 0, 1) !== '1') {
            return redirect(env('FRONTEND_URL') . '/login?error=bukan_sarjana');
        }

        // Cek angkatan (digit 2-3 = 23 atau 24)
        $angkatan = substr($nimDigits, 1, 2);
        if (!in_array($angkatan, ['23', '24'])) {
            return redirect(env('FRONTEND_URL') . '/login?error=angkatan_tidak_valid');
        }

        // Cek prodi (digit 4-5 = 14, informatika)
        $prodi = substr($nimDigits, 3, 2);
        if ($prodi !== '14') {
            return redirect(env('FRONTEND_URL') . '/login?error=bukan_informatika');
        }

        // Cek NIM terdaftar di database
        if (!User::where('nim', $nim)->exists()) {
            return redirect(env('FRONTEND_URL') . '/login?error=nim_tidak_terdaftar');
        }

        // Cek status akun
        $existingUser = User::where('nim', $nim)->first();
        if ($existingUser && $existingUser->status === 'non-aktif') {
            return redirect(env('FRONTEND_URL') . '/login?error=akun_nonaktif');
        }

        $user = User::updateOrCreate(
            ['nim' => $nim],
            [
                'google_id' => $googleUser->getId(),
                'name'      => $googleUser->getName(),
                'email'     => $email,
                'status'    => 'aktif',
            ]
        );

        // Set role anggota hanya kalau user baru
        if ($user->wasRecentlyCreated) {
            $user->update(['role' => 'anggota']);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return redirect(env('FRONTEND_URL') . '/auth/callback?token=' . $token . '&role=' . $user->role . '&email=' . $email . '&name=' . urlencode($user->name));
    }

    // Logout — hapus semua token Sanctum user
    public function logout(Request $request)
    {
        // deleteCurrentToken() hapus token yang sedang dipakai
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }
}