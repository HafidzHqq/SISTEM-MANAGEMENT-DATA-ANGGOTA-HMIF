<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->index(['event_id', 'checkin_time'], 'attendances_event_checkin_time_index');
            $table->index('user_id', 'attendances_user_id_lookup_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('attendances_event_checkin_time_index');
            $table->dropIndex('attendances_user_id_lookup_index');
        });
    }
};
