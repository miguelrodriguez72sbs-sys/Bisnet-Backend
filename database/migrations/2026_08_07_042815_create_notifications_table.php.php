<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            // A quién le llega la notificación
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Quién la generó (quien dio like, quien mandó el mensaje, etc.)
            $table->foreignId('from_user_id')->nullable()->constrained('users')->onDelete('cascade');
            // 'like' | 'message'
            $table->string('type');
            // Datos extra en json: post_id, message_id, preview del texto, etc.
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
