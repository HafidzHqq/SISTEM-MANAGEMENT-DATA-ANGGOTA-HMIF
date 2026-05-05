<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'departemen'         => 'nullable|string|max:100',
            'jabatan'            => 'nullable|string|max:100',
            'status_keanggotaan' => 'nullable|in:Muda,Tetap,Luar Biasa',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Parse angkatan dari NIM (digit ke-2 dan ke-3)
        // Contoh: 124140097 → angkatan 2024
        $nim = preg_replace('/\D/', '', $user->nim ?? '');
        $angkatan = null;
        if (strlen($nim) >= 3) {
            $angkatan = (int)('20' . substr($nim, 1, 2));
        }

        $user->memberProfile()->updateOrCreate(
            ['user_id' => $user->user_id],
            array_merge(
                $request->only(['departemen', 'jabatan', 'status_keanggotaan']),
                ['angkatan' => $angkatan]
            )
        );

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'profile' => $user->fresh()->memberProfile,
        ]);
    }
}