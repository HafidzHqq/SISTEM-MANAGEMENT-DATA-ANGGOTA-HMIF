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
        // Ambil data user dari Google
        $googleUser = Socialite::driver('google')->stateless()->user();

        // Validasi domain email, hanya @student.itera.ac.id yang boleh
        $email = $googleUser->getEmail();
        if (!str_ends_with($email, '@student.itera.ac.id')) {
            // Redirect ke React dengan error query param
            return redirect(env('FRONTEND_URL') . '/login?error=domain_tidak_valid');
        }

        // Cari user berdasarkan google_id, kalau belum ada buat baru
        // Extract NIM dari email
        // Format: nama.nim@student.itera.ac.id
        $nimPart = explode('@', $email)[0]; // hasil: nama.nim
        $nim = explode('.', $nimPart)[1]; // hasil: nim

        $user = User::updateOrCreate(
            ['google_id' => $googleUser->getId()],
            [
                'name'   => $googleUser->getName(),
                'email'  => $email,
                'nim'    => $nim,
                'status' => 'aktif',
            ]
        );

        // Set role anggota hanya kalau user baru
        if ($user->wasRecentlyCreated) {
            $user->update(['role' => 'anggota']);
        }

        // Jangan overwrite role kalau user sudah ada
        if ($user->wasRecentlyCreated) {
            // user baru, role sudah di-set anggota di atas
        } else {
            // user lama, jangan ubah role
            $user->refresh();
        }

        // Set role anggota hanya kalau user baru (belum punya role)
        if (!$user->role) {
            $user->update(['role' => 'anggota']);
        }

        // Generate Sanctum token untuk user ini
        // Token ini yang akan dipakai React untuk request ke API selanjutnya
        $token = $user->createToken('auth_token')->plainTextToken;

        // Redirect ke React dengan token di query param
        // React akan ambil token ini dan simpan di localStorage
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