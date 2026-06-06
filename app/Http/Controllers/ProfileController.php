<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    // VER PERFIL
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    // EDITAR PERFIL
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'career'      => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
        ]);

        $user->update($request->only(['name', 'career', 'description']));

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'user'    => $user,
        ]);
    }
}