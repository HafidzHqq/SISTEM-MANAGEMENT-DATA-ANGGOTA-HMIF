<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Event;

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

    // ambil data user
    public function user() {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    // ambil data event
    public function event() {
        return $this->belongsTo(Event::class, 'event_id', 'event_id');
    }
}
