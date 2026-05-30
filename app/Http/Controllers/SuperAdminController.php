<?php

namespace App\Http\Controllers;

// Fitur: API Super Admin - Manajemen Akun Admin
// Deskripsi: Super admin dapat mengelola akun admin (promote, demote, nonaktifkan)

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class SuperAdminController extends Controller
{
    // GET /api/admins — list semua admin
    public function index()
    {
        $admins = User::where('role', 'admin')
            ->get(['user_id', 'name', 'email', 'nim', 'role', 'status', 'created_at']);

        return response()->json($admins);
    }

    // POST /api/admins/{id}/promote — jadikan user sebagai admin
    public function promote(Request $request, $id)
    {
        $user = User::where('user_id', $id)->where('role', 'anggota')->first();

        if (!$user) {
            return response()->json(['message' => 'Anggota tidak ditemukan'], 404);
        }

        $user->update(['role' => 'admin']);

        AuditLog::catat($request->user()->user_id, 'promote', 'user', $id);

        return response()->json([
            'message' => 'Anggota berhasil dijadikan admin',
            'data'    => $user->fresh(),
        ]);
    }

    // POST /api/admins/{id}/demote — turunkan admin jadi anggota
    public function demote(Request $request, $id)
    {
        $user = User::where('user_id', $id)->where('role', 'admin')->first();

        if (!$user) {
            return response()->json(['message' => 'Admin tidak ditemukan'], 404);
        }

        $user->update(['role' => 'anggota']);

        AuditLog::catat($request->user()->user_id, 'demote', 'user', $id);

        return response()->json([
            'message' => 'Admin berhasil diturunkan jadi anggota',
            'data'    => $user->fresh(),
        ]);
    }

    // PATCH /api/admins/{id}/status — nonaktifkan/aktifkan admin
    public function toggleStatus(Request $request, $id)
    {
        $user = User::where('user_id', $id)->where('role', 'admin')->first();

        if (!$user) {
            return response()->json(['message' => 'Admin tidak ditemukan'], 404);
        }

        $newStatus = $user->status === 'aktif' ? 'non-aktif' : 'aktif';
        $user->update(['status' => $newStatus]);

        AuditLog::catat($request->user()->user_id, 'toggle_status', 'user', $id);

        return response()->json([
            'message' => 'Status admin berhasil diubah menjadi ' . $newStatus,
            'data'    => $user->fresh(),
        ]);
    }

    // DELETE /api/admins/{id} — hapus admin
    public function destroy(Request $request, $id)
    {
        $user = User::where('user_id', $id)
            ->whereIn('role', ['admin', 'anggota'])
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        AuditLog::catat($request->user()->user_id, 'delete', 'user', $id);

        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus']);
    }
}