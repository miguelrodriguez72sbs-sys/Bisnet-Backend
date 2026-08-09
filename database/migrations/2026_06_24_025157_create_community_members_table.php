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
    Schema::create('community_members', function (Blueprint $table) {
    $table->id();
    $table->foreignId('community_id')->constrained()->onDelete('cascade');
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->enum('role', ['admin', 'member'])->default('member');
    $table->enum('status', ['pending', 'approved'])->default('approved');
    $table->timestamps();
    $table->unique(['community_id', 'user_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_members');
    }
};
