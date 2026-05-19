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
}