<?php

namespace App\Http\Controllers;

// Fitur: Audit Log
// Deskripsi: Mencatat setiap perubahan data yang dilakukan admin dan menampilkannya ke super_admin

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    // GET /api/audit-logs — ambil semua log aktivitas
    public function index(Request $request)
    {
        $query = AuditLog::with('actor')
            ->orderBy('created_at', 'desc');

        // Filter by actor (admin tertentu)
        if ($request->has('actor_id')) {
            $query->where('actor_id', $request->actor_id);
        }

        // Filter by jenis aksi
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        $logs = $query->get();

        return response()->json($logs);
    }
}