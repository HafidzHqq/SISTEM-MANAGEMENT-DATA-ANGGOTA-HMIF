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
            'foto' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $user = $request->user();
        $path = $request->file('foto')->store('profile-photos', 'public');
        $absolutePath = storage_path('app/public/' . $path);

        // Kompres foto sebelum disimpan
        $this->compressImage($absolutePath);

        $user->memberProfile()->updateOrCreate(
            ['user_id' => $user->user_id],
            ['foto' => $path]
        );

        return response()->json([
            'message' => 'Foto berhasil diperbarui',
            'foto_url' => asset('storage/' . $path),
        ]);
    }

    private function compressImage($absolutePath)
    {
        // Mendapatkan informasi file gambar
        $info = getimagesize($absolutePath);
        if (!$info) return;

        $mime = $info['mime'];
        
        // Memuat gambar berdasarkan MIME type
        switch ($mime) {
            case 'image/jpeg':
                $image = @imagecreatefromjpeg($absolutePath);
                break;
            case 'image/png':
                $image = @imagecreatefrompng($absolutePath);
                if ($image) {
                    imagealphablending($image, false);
                    imagesavealpha($image, true);
                }
                break;
            case 'image/webp':
                $image = @imagecreatefromwebp($absolutePath);
                break;
            default:
                return;
        }

        if (!$image) return;

        // Resize gambar jika ukurannya melebihi 800px (lebar atau tinggi)
        $maxWidth = 800;
        $maxHeight = 800;
        $width = imagesx($image);
        $height = imagesy($image);

        if ($width > $maxWidth || $height > $maxHeight) {
            if ($width > $height) {
                $newWidth = $maxWidth;
                $newHeight = (int)($height * ($maxWidth / $width));
            } else {
                $newHeight = $maxHeight;
                $newWidth = (int)($width * ($maxHeight / $height));
            }

            $newImage = imagecreatetruecolor($newWidth, $newHeight);
            
            // Pertahankan transparansi untuk PNG dan WEBP
            if ($mime === 'image/png' || $mime === 'image/webp') {
                imagealphablending($newImage, false);
                imagesavealpha($newImage, true);
            }

            imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $newImage;
        }

        // Simpan kembali gambar dengan kompresi
        switch ($mime) {
            case 'image/jpeg':
                imagejpeg($image, $absolutePath, 75); // Kualitas 75%
                break;
            case 'image/png':
                imagepng($image, $absolutePath, 7); // Kompresi level 7
                break;
            case 'image/webp':
                imagewebp($image, $absolutePath, 75); // Kualitas 75%
                break;
        }

        imagedestroy($image);
    }
}
