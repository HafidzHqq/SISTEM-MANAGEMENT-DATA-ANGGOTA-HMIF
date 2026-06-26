<?php

namespace App\Http\Controllers;

// Fitur: API Manajemen Anggota
// Deskripsi: CRUD data anggota HMIF, hanya bisa diakses oleh admin dan super_admin

use App\Models\User;
use App\Models\MemberProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use App\Models\AuditLog;

class MemberController extends Controller
{
    private const MEMBER_DIRECTORY_ROLES = ['anggota', 'admin', 'super_admin'];
    private const DEPARTMENT_OPTIONS = ['KEPROF', 'PSDA', 'INTERNAL', 'EXTERNAL', 'KOMINFO', 'KESEKJENAN'];
    private const POSITION_OPTIONS = ['-', 'Ketua Departemen', 'Ketua Divisi', 'Sekertaris Departemen', 'Staf Ahli', 'Staf'];

    // GET /api/members ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ambil semua anggota beserta profilnya
    public function index(Request $request)
    {
        $query = User::with('memberProfile')
            ->whereIn('role', self::MEMBER_DIRECTORY_ROLES);

        // Filter by departemen
        if ($request->filled('departemen')) {
            $departmentColumn = Schema::hasColumn('member_profiles', 'departemen')
            ? 'departemen'
            : 'Departemen';

            $query->whereHas('memberProfile', function ($q) use ($request, $departmentColumn) {
                $q->where($departmentColumn, $request->departemen);
            });
        }

        // Filter by angkatan
        if ($request->filled('angkatan')) {
            $query->whereHas('memberProfile', function ($q) use ($request) {
                $q->where('angkatan', $request->angkatan);
            });
        }

        // Search by nama atau nim
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('nim', 'like', "%$search%");
            });
        }

        $members = $query->get();

        return response()->json($members);
    }

    // GET /api/members/{id} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ambil detail 1 anggota
    public function show($id)
    {
        $user = User::with('memberProfile')
            ->where('user_id', $id)
            ->whereIn('role', self::MEMBER_DIRECTORY_ROLES)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Anggota tidak ditemukan'], 404);
        }

        return response()->json($user);
    }

    // PUT /api/members/{id} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â update data anggota oleh admin
    public function update(Request $request, $id)
    {
        $user = User::where('user_id', $id)
            ->whereIn('role', self::MEMBER_DIRECTORY_ROLES)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Anggota tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'departemen'         => 'nullable|in:' . implode(',', self::DEPARTMENT_OPTIONS),
            'jabatan'            => 'nullable|in:' . implode(',', self::POSITION_OPTIONS),
            'status_keanggotaan' => 'nullable|in:Muda,Tetap,Luar Biasa',
            'no_telepon'         => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $profileData = $request->only(['jabatan', 'status_keanggotaan', 'no_telepon']);
        $departemenColumn = Schema::hasColumn('member_profiles', 'departemen')
            ? 'departemen'
            : 'Departemen';
        $profileData[$departemenColumn] = $request->input('departemen') ?: null;

        $user->memberProfile()->updateOrCreate(
            ['user_id' => $user->user_id],
            $profileData
        );

        AuditLog::catat($request->user()->user_id, 'update', 'member', $id);

        return response()->json([
            'message' => 'Data anggota berhasil diperbarui',
            'data'    => $user->fresh()->load('memberProfile'),
        ]);

    }

    // DELETE /api/members/{id} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â hapus anggota
    public function destroy(Request $request, $id)
    {
        $user = User::where('user_id', $id)
            ->whereIn('role', self::MEMBER_DIRECTORY_ROLES)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Anggota tidak ditemukan'], 404);
        }

        if (in_array($user->role, ['admin', 'super_admin'], true)) {
            return response()->json([
                'message' => 'Admin dan super admin tidak dapat dihapus dari manajemen anggota. Kelola aksesnya melalui panel super admin.',
            ], 403);
        }

        AuditLog::catat($request->user()->user_id, 'delete', 'member', $id);

        $user->delete();

        return response()->json(['message' => 'Anggota berhasil dihapus']);

    }

        // POST /api/members/import ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â import bulk via CSV
        public function import(Request $request)
        {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|mimes:csv,txt|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'File tidak valid',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            $file = $request->file('file');
            $rows = array_map('str_getcsv', file($file->getRealPath()));
            $header = array_shift($rows); // ambil baris pertama sebagai header

            $berhasil = 0;
            $gagal = [];

            foreach ($rows as $index => $row) {
                $data = array_combine($header, $row);

                // Cek kolom wajib
                if (empty($data['nim']) || empty($data['name']) || empty($data['email'])) {
                    $gagal[] = "Baris " . ($index + 2) . ": kolom nim, name, email wajib ada";
                    continue;
                }

                // Cek duplikat
                if (User::where('nim', $data['nim'])->orWhere('email', $data['email'])->exists()) {
                    $gagal[] = "Baris " . ($index + 2) . ": NIM atau email sudah terdaftar";
                    continue;
                }

                // Validasi format NIM
                $nimDigits = preg_replace('/\D/', '', $data['nim']);
                if (
                    substr($nimDigits, 0, 1) !== '1' ||
                    !in_array(substr($nimDigits, 1, 2), ['23', '24']) ||
                    substr($nimDigits, 3, 2) !== '14'
                ) {
                    $gagal[] = "Baris " . ($index + 2) . ": gagal memasukan data";
                    continue;
                }

                User::create([
                    'nim'    => $data['nim'],
                    'name'   => $data['name'],
                    'email'  => $data['email'],
                    'role'   => 'anggota',
                    'status' => 'aktif',
                ]);

                $berhasil++;
            }

            AuditLog::catat($request->user()->user_id, 'import', 'member', 0);

            return response()->json([
                'message'  => "$berhasil anggota berhasil diimport",
                'gagal'    => $gagal,
            ]);
        }
}
