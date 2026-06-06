<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MemberProfile extends Model
{
    protected $primaryKey = 'profile_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'angkatan',
        'departemen',
        'Departemen',
        'jabatan',
        'status_keanggotaan',
        'no_telepon',
        'foto',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }
}
