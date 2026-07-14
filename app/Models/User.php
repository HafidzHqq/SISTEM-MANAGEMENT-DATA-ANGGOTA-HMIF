<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Attendance;

/**
 * @property int    $user_id
 * @property string|null $google_id
 * @property string $email
 * @property string|null $nim
 * @property string $name
 * @property string $role
 * @property string $status
 * @property string|null $remember_token
 * @property \App\Models\MemberProfile|null $memberProfile
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;
    use HasApiTokens;

    protected $primaryKey = 'user_id';

    protected $fillable = [
       'google_id',
        'email',
        'nim',
        'name',
        'role',
        'status',
    ];

    protected $hidden = [
        'remember_token',
    ];

    public function memberProfile() {
        return $this->hasOne(MemberProfile::class, 'user_id', 'user_id');
    }

    public function auditLogs() {
        return $this->hasOne(AuditLog::class, 'actor_id', 'user_id');
    }

    public function attendances() {
        return $this->hasMany(Attendance::class, 'user_id', 'user_id');
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }
}
