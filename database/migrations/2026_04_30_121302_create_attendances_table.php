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
    Schema::create('attendances', function (Blueprint $table) {
        $table->id('attendance_id');
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('event_id')->constrained('events', 'event_id')->onDelete('cascade');
        $table->dateTime('checkin_time')->nullable();
        $table->decimal('user_latitude', 10, 7)->nullable();
        $table->decimal('user_longitude', 10, 7)->nullable();
        $table->boolean('is_in_radius')->default(false);
        $table->string('status')->default('present');
        $table->text('remarks')->nullable();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
