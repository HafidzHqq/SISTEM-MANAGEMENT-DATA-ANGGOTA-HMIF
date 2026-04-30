<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $primaryKey = 'event_id';

    protected $fillable = [
        'title', 
        'description', 
        'date_time',
        'attendance_window_start', 
        'attendance_window_end',
        'qr_token', 
        'latitude_center', 
        'longitude_center',
        'radius_meter', 
        'created_by'
    ];
}
