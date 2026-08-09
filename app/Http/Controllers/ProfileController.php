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

    // SUBIR / CAMBIAR FOTO DE PERFIL
    public function updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:5120', // 5MB máx
        ]);

        $user = $request->user();

        // Borra la foto anterior si existe
        if ($user->profile_photo) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_photo);
        }

        $path = $request->file('photo')->store('profile_photos', 'public');

        $user->update(['profile_photo' => $path]);

        return response()->json([
            'message' => 'Foto de perfil actualizada correctamente.',
            'user'    => $user,
        ]);
    }
}
