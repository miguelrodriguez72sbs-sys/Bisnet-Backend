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
        Schema::create('estadias', function (Blueprint $table) {
            $table->id();
            $table->string('empresa');
            $table->string('giro')->nullable();
            $table->text('contacto')->nullable();
            $table->text('correo')->nullable();
            $table->text('telefono')->nullable();
            $table->text('direccion')->nullable();
            $table->string('carrera')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estadias');
    }
};