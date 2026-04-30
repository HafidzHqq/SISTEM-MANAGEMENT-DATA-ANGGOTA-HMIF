<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Archive extends Model
{
    protected $primaryKey = 'archive_id';

    protected $fillable = [
        'attendance_id', 
        'archived_at'
    ];
}
