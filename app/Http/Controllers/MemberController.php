<?php

namespace App\Http\Controllers;

// Fitur: API Manajemen Anggota
// Deskripsi: CRUD data anggota HMIF, hanya bisa diakses oleh admin dan super_admin

use App\Models\User;
use App\Models\MemberProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\AuditLog;

class MemberController extends Controller
{
    // GET /api/members — ambil semua anggota beserta profilnya
    public function index(Request $request)
    {
        $query = User::with('memberProfile')
            ->where('role', 'anggota');

        // Filter by divisi
        if ($request->has('divisi')) {
            $query->whereHas('memberProfile', function ($q) use ($request) {
                $q->where('departemen', $request->divisi);
            });
        }

        // Filter by angkatan
        if ($request->has('angkatan')) {
            $query->whereHas('memberProfile', function ($q) use ($request) {
                $q->where('angkatan', $request->angkatan);
            });
        }

        // Search by nama atau nim
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%$search%")
                  ->orWhere('nim', 'ilike', "%$search%");
            });
        }

        $members = $query->get();

        return response()->json($members);
    }

    // GET /api/members/{id} — ambil detail 1 anggota
    public function show($id)
    {
        $user = User::with('memberProfile')
            ->where('user_id', $id)
            ->where('role', 'anggota')
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Anggota tidak ditemukan'], 404);
        }

        return response()->json($user);
    }

    // PUT /api/members/{id} — update data anggota oleh admin
    public function update(Request $request, $id)
    {
        $user = User::where('user_id', $id)->where('role', 'anggota')->first();

        if (!$user) {
            return response()->json(['message' => 'Anggota tidak ditemukan'], 404);
        }

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

        $user->memberProfile()->updateOrCreate(
            ['user_id' => $user->user_id],
            $request->only(['departemen', 'jabatan', 'status_keanggotaan'])
        );

        AuditLog::catat($request->user()->user_id, 'update', 'member', $id);

        return response()->json([
            'message' => 'Data anggota berhasil diperbarui',
            'data'    => $user->fresh()->load('memberProfile'),
        ]);

    }

    // DELETE /api/members/{id} — hapus anggota
    public function destroy(Request $request, $id)
    {
        $user = User::where('user_id', $id)->where('role', 'anggota')->first();

        if (!$user) {
            return response()->json(['message' => 'Anggota tidak ditemukan'], 404);
        }

        AuditLog::catat($request->user()->user_id, 'delete', 'member', $id);

        $user->delete();

        return response()->json(['message' => 'Anggota berhasil dihapus']);

    }

            // POST /api/members — tambah 1 anggota manual
        public function store(Request $request)
        {
            $validator = Validator::make($request->all(), [
                'nim'   => 'required|string|max:15|unique:users,nim',
                'name'  => 'required|string|max:150',
                'email' => 'required|email|unique:users,email',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validasi gagal',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            // Validasi format NIM
            $nimDigits = preg_replace('/\D/', '', $request->nim);
            if (
                substr($nimDigits, 0, 1) !== '1' ||
                !in_array(substr($nimDigits, 1, 2), ['23', '24']) ||
                substr($nimDigits, 3, 2) !== '14'
            ) {
                return response()->json(['message' => 'Gagal memasukan data'], 422);
            }

            $user = User::create([
                'nim'    => $request->nim,
                'name'   => $request->name,
                'email'  => $request->email,
                'role'   => 'anggota',
                'status' => 'aktif',
            ]);

            AuditLog::catat($request->user()->user_id, 'create', 'member', $user->user_id);

            return response()->json([
                'message' => 'Anggota berhasil ditambahkan',
                'data'    => $user,
            ], 201);
        }

        // POST /api/members/import — import bulk via CSV
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