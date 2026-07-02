<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

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
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (Throwable $exception) {
            \Log::error('Google Login Error: ' . $exception->getMessage(), ['exception' => $exception]);
            return $this->redirectToFrontend('/login', [
                'error' => 'google_session_expired',
            ]);
        }

        $email = $googleUser->getEmail();
        if (!str_ends_with($email, '@student.itera.ac.id')) {
            return $this->redirectToFrontend('/login', [
                'error' => 'domain_tidak_valid',
            ]);
        }

        // Extract NIM dari email. Format yang diharapkan: nama.nim@student.itera.ac.id
        $nimPart = explode('@', $email)[0];
        $nimSegments = explode('.', $nimPart);
        $nim = end($nimSegments);

        // Validasi format NIM
        $nimDigits = preg_replace('/\D/', '', $nim);
        if ($nimDigits === '' || $nimDigits !== $nim) {
            return $this->redirectToFrontend('/login', [
                'error' => 'format_email_tidak_valid',
            ]);
        }

        // Cek jenjang (digit 1 = sarjana)
        if (substr($nimDigits, 0, 1) !== '1') {
            return $this->redirectToFrontend('/login', [
                'error' => 'bukan_sarjana',
            ]);
        }

        // Cek angkatan (digit 2-3)
        $angkatan = substr($nimDigits, 1, 2);
        if (!in_array($angkatan, ['22', '23', '24', '25'])) {
            return $this->redirectToFrontend('/login', [
                'error' => 'angkatan_tidak_valid',
            ]);
        }

        // Cek prodi (digit 4-5 = 14, informatika)
        $prodi = substr($nimDigits, 3, 2);
        if ($prodi !== '14') {
            return $this->redirectToFrontend('/login', [
                'error' => 'bukan_informatika',
            ]);
        }

        // Cek status akun
        $existingUser = User::where('nim', $nim)->first();
        if ($existingUser && $existingUser->status === 'non-aktif') {
            return $this->redirectToFrontend('/login', [
                'error' => 'akun_nonaktif',
            ]);
        }

        $user = User::updateOrCreate(
            ['nim' => $nim],
            [
                'google_id' => $googleUser->getId(),
                'name'      => $googleUser->getName(),
                'email'     => $email,
                'role'      => $existingUser?->role ?? 'anggota',
                'status'    => 'aktif',
            ]
        );

        $departemenColumn = Schema::hasColumn('member_profiles', 'departemen')
            ? 'departemen'
            : 'Departemen';

        $statusKeanggotaan = in_array($angkatan, ['22', '23'], true)
            ? 'Tetap'
            : ($angkatan === '24' ? 'Muda' : 'Luar Biasa');

        $user->memberProfile()->firstOrCreate(
            ['user_id' => $user->user_id],
            [
                'angkatan' => (int) ('20' . $angkatan),
                $departemenColumn => 'Belum Ditentukan',
                'jabatan' => 'Anggota',
                'status_keanggotaan' => $statusKeanggotaan,
            ]
        );

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->redirectToFrontend('/auth/callback', [
            'token' => $token,
            'role' => $user->role,
            'email' => $email,
            'name' => $user->name,
        ]);
    }

    // Logout - hapus semua token Sanctum user
    public function logout(Request $request)
    {
        // deleteCurrentToken() hapus token yang sedang dipakai
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    private function redirectToFrontend(string $path, array $query = [])
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', config('app.url')), '/');
        $path = '/' . ltrim($path, '/');
        $queryString = $query ? '?' . http_build_query($query) : '';

        return redirect($frontendUrl . $path . $queryString);
    }
}
