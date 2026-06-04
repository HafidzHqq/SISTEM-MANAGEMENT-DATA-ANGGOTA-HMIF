<?php

namespace App\Console\Commands;

use App\Models\Archive;
use App\Models\Attendance;
use Illuminate\Console\Command;

class ArchiveOldAttendances extends Command
{
    protected $signature = 'attendance:archive-old {--days=30} {--dry-run}';

    protected $description = 'Menandai attendance lama sebagai archived tanpa menghapus data attendance';

    public function handle()
    {
        $days = (int) $this->option('days');

        if ($days < 1) {
            $this->error('Option --days harus lebih dari 0.');
            return self::FAILURE;
        }

        $cutoff = now()->subDays($days);

        $query = Attendance::whereHas('event', function ($query) use ($cutoff) {
            $query->where('attendance_window_end', '<', $cutoff);
        })->whereDoesntHave('archive');

        $totalCandidates = $query->count();

        if ($this->option('dry-run')) {
            $this->info("Ada {$totalCandidates} attendance yang akan diarsipkan.");
            return self::SUCCESS;
        }

        $archivedCount = 0;

        $query->chunkById(100, function ($attendances) use (&$archivedCount) {
            foreach ($attendances as $attendance) {
                Archive::firstOrCreate(
                    ['attendance_id' => $attendance->attendance_id],
                    ['archived_at' => now()]
                );

                $archivedCount++;
            }
        }, 'attendance_id');

        $this->info("Berhasil mengarsipkan {$archivedCount} attendance.");

        return self::SUCCESS;
    }
}