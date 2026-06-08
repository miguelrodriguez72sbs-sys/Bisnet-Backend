<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerificarCorreoInstitucional
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        $dominio = substr(strrchr($user->email, "@"), 1);
        $dominiosPermitidos = ['utbispuebla.edu.mx'];

        if (!in_array($dominio, $dominiosPermitidos)) {
            return response()->json([
                'message' => 'Solo usuarios con correo institucional pueden acceder.'
            ], 403);
        }

        return $next($request);
    }
}