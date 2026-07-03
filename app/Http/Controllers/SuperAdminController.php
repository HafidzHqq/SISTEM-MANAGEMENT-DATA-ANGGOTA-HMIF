<?php

namespace App\Http\Controllers;

// Fitur: API Super Admin - Manajemen Akun Admin
// Deskripsi: Super admin dapat mengelola akun admin (promote, demote, nonaktifkan)

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class SuperAdminController extends Controller
{
    // GET /api/admins — list semua admin dan super admin
    public function index()
    {
        $admins = User::with('memberProfile')
            ->whereIn('role', ['admin', 'super_admin'])
            ->get(['user_id', 'name', 'email', 'nim', 'role', 'status', 'created_at']);

        return response()->json($admins);
    }

    // POST /api/admins/{id}/promote — jadikan user sebagai admin atau super_admin
    public function promote(Request $request, $id)
    {
        $user = User::where('user_id', $id)->where('role', 'anggota')->first();

        if (!$user) {
            return response()->json(['message' => 'Anggota tidak ditemukan'], 404);
        }

        $targetRole = $request->input('role', 'admin');
        if (!in_array($targetRole, ['admin', 'super_admin'], true)) {
            $targetRole = 'admin';
        }

        $user->update(['role' => $targetRole]);
        $details = "Jabatan diubah menjadi: " . ($targetRole === 'super_admin' ? 'Super Admin' : 'Admin');
        AuditLog::catat($request->user()->user_id, 'promote', 'user', $id, $details);

        return response()->json([
            'message' => 'Anggota berhasil dijadikan ' . ($targetRole === 'super_admin' ? 'Super Admin' : 'Admin'),
            'data'    => $user->fresh(),
        ]);
    }

    // POST /api/admins/{id}/demote — turunkan admin/super admin jadi anggota
    public function demote(Request $request, $id)
    {
        if ($request->user()->user_id == $id) {
            return response()->json(['message' => 'Anda tidak dapat menurunkan jabatan Anda sendiri.'], 403);
        }

        $user = User::where('user_id', $id)->whereIn('role', ['admin', 'super_admin'])->first();

        if (!$user) {
            return response()->json(['message' => 'Admin atau Super Admin tidak ditemukan'], 404);
        }

        $user->update(['role' => 'anggota']);
        $details = "Jabatan diturunkan menjadi Anggota";
        AuditLog::catat($request->user()->user_id, 'demote', 'user', $id, $details);

        return response()->json([
            'message' => 'Jabatan berhasil diturunkan menjadi anggota',
            'data'    => $user->fresh(),
        ]);
    }

    // PATCH /api/admins/{id}/status — nonaktifkan/aktifkan admin/super admin
    public function toggleStatus(Request $request, $id)
    {
        if ($request->user()->user_id == $id) {
            return response()->json(['message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri.'], 403);
        }

        $user = User::where('user_id', $id)->whereIn('role', ['admin', 'super_admin'])->first();

        if (!$user) {
            return response()->json(['message' => 'Admin atau Super Admin tidak ditemukan'], 404);
        }

        $newStatus = $user->status === 'aktif' ? 'non-aktif' : 'aktif';
        $user->update(['status' => $newStatus]);
        $details = "Status diubah menjadi: " . ($newStatus === 'aktif' ? 'Aktif' : 'Non-Aktif');
        AuditLog::catat($request->user()->user_id, 'toggle_status', 'user', $id, $details);

        return response()->json([
            'message' => 'Status berhasil diubah menjadi ' . $newStatus,
            'data'    => $user->fresh(),
        ]);
    }

    // DELETE /api/admins/{id} — hapus admin/super admin/anggota
    public function destroy(Request $request, $id)
    {
        if ($request->user()->user_id == $id) {
            return response()->json(['message' => 'Anda tidak dapat menghapus akun Anda sendiri.'], 403);
        }

        $user = User::where('user_id', $id)
            ->whereIn('role', ['admin', 'super_admin', 'anggota'])
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $details = "Menghapus akun: {$user->name} ({$user->email})";
        AuditLog::catat($request->user()->user_id, 'delete', 'user', $id, $details);

        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus']);
    }
}