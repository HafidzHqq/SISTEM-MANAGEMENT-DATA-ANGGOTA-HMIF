<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    // Fitur: Middleware Role
    // Deskripsi: Memproteksi endpoint berdasarkan role user (anggota, admin, super_admin)
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Unauthorized, anda tidak memiliki akses'
            ], 403);
        }

        return $next($request);
    }
}