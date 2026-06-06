<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'identification' => 'required|string|unique:users',
            'email'          => 'required|email|unique:users',
            'password'       => 'required|string|min:6',
        ]);

        $user = User::create([
            'name'           => $request->name,
            'identification' => $request->identification,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'role'           => 'student',
        ]);

        $token = $user->createToken('bisnet_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente.',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales incorrectas.'],
            ]);
        }

        $token = $user->createToken('bisnet_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}