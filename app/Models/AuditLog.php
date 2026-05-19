<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $primaryKey = 'log_id';
    public $timestamps = false;

    protected $fillable = [
        'actor_id',
        'action',
        'target_type',
        'target_id',
        'created_at',
    ];

    public function actor() {
        return $this->belongsTo(User::class, 'actor_id', 'user_id');
    }

    public static function catat($actorId, $action, $targetType, $targetId) {
        self::create([
        'actor_id'    => $actorId,
        'action'      => $action,
        'target_type' => $targetType,
        'target_id'   => $targetId,
        'created_at'  => now(),
        ]);
    }
}
