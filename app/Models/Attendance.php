<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $primaryKey = 'attendance_id';

    protected $fillable = [
        'user_id', 
        'event_id', 
        'checkin_time',
        'user_latitude', 
        'user_longitude',
        'is_in_radius', 
        'status', 
        'remarks'
    ];
}
