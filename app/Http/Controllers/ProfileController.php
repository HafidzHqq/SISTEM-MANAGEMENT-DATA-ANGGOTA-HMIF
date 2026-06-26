<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
// Fitur: API Manajemen Profil Anggota
// Deskripsi: Mengizinkan anggota untuk memperbarui data profil pribadi mereka sendiri
class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'departemen'         => 'nullable|string|max:100',
            'jabatan'            => 'nullable|string|max:100',
            'status_keanggotaan' => 'nullable|in:Muda,Tetap,Luar Biasa',
            'no_telepon'         => 'nullable|string|max:20'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Parse angkatan dari NIM (digit ke-2 dan ke-3)
        // Contoh: 124140097 Ã¢â€ â€™ angkatan 2024
        $nim = preg_replace('/\D/', '', $user->nim ?? '');
        $angkatan = null;
        if (strlen($nim) >= 3) {
            $angkatan = (int)('20' . substr($nim, 1, 2));
        }

        $profileData = $request->only(['jabatan', 'status_keanggotaan', 'no_telepon']);
        $departemenColumn = Schema::hasColumn('member_profiles', 'departemen')
            ? 'departemen'
            : 'Departemen';
        $profileData[$departemenColumn] = $request->input('departemen');
        $profileData['angkatan'] = $angkatan;

        $user->memberProfile()->updateOrCreate(
            ['user_id' => $user->user_id],
            $profileData
        );

        $profile = $user->fresh()->memberProfile;
        $profileData = $profile?->toArray();

        if ($profileData) {
            $profileData['departemen'] = $profileData['departemen'] ?? ($profileData['Departemen'] ?? null);
            $profileData['Departemen'] = $profileData['Departemen'] ?? ($profileData['departemen'] ?? null);
        }

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'profile' => $profileData,
        ]);
    }

    public function uploadFoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $user = $request->user();
        $path = $request->file('foto')->store('profile-photos', 'public');

        $user->memberProfile()->updateOrCreate(
            ['user_id' => $user->user_id],
            ['foto' => $path]
        );

        return response()->json([
            'message' => 'Foto berhasil diperbarui',
            'foto_url' => asset('storage/' . $path),
        ]);
    }
}
