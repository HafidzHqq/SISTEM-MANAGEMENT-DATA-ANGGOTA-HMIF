<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Attendance;

/**
 * @property int    $event_id
 * @property string $title
 * @property string|null $description
 * @property string|null $location
 * @property string|null $date_time
 * @property string|null $attendance_window_start
 * @property string|null $attendance_window_end
 * @property string|null $qr_token
 * @property float|null  $latitude_center
 * @property float|null  $longitude_center
 * @property float|null  $radius_meter
 * @property int|null    $created_by
 */
class Event extends Model
{
    protected $primaryKey = 'event_id';

    protected $fillable = [
        'title', 
        'description', 
        'location',
        'date_time',
        'attendance_window_start', 
        'attendance_window_end',
        'qr_token', 
        'latitude_center', 
        'longitude_center',
        'radius_meter', 
        'created_by'
    ];

    // ambil data kehadiran
    public function attendances() {
        return $this->hasMany(Attendance::class, 'event_id', 'event_id');
    }
}
