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
        Schema::create('events', function (Blueprint $table) {
            $table->id('event_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('date_time');
            $table->dateTime('attendance_window_start');
            $table->dateTime('attendance_window_end');
            $table->string('qr_token')->unique();
            $table->decimal('latitude_center', 10, 7)->nullable();
            $table->decimal('longitude_center', 10, 7)->nullable();
            $table->integer('radius_meter')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->foreign('created_by')->references('user_id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};