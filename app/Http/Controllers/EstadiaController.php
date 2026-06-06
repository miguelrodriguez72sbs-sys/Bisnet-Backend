<?php

namespace App\Http\Controllers;

use App\Models\Estadia;
use Illuminate\Http\Request;

class EstadiaController extends Controller
{
    // VER TODAS LAS ESTADÍAS
    public function index(Request $request)
    {
        $query = Estadia::query();

        if ($request->has('carrera')) {
            $query->where('carrera', 'like', '%' . $request->carrera . '%');
        }

        if ($request->has('search')) {
            $query->where('empresa', 'like', '%' . $request->search . '%');
        }

        $estadias = $query->orderBy('empresa')->get();

        return response()->json($estadias);
    }

    // VER UNA ESTADÍA
    public function show($id)
    {
        $estadia = Estadia::find($id);

        if (!$estadia) {
            return response()->json(['message' => 'Estadía no encontrada.'], 404);
        }

        return response()->json($estadia);
    }
}