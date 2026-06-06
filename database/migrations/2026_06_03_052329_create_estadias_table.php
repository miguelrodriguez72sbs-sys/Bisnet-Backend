<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estadia extends Model
{
    use HasFactory;

    protected $table = 'estadias';

    protected $fillable = [
        'empresa',
        'giro',
        'contacto',
        'correo',
        'telefono',
        'direccion',
        'carrera',
    ];
}