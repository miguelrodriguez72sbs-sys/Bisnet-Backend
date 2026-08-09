<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // LISTAR MIS NOTIFICACIONES
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications() // hasMany definido abajo vía relación inline
            ->with('fromUser:id,name,profile_photo')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($notifications);
    }

    // MARCAR UNA COMO LEÍDA
    public function markRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notificación no encontrada.'], 404);
        }

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Notificación marcada como leída.']);
    }

    // MARCAR TODAS COMO LEÍDAS
    public function markAllRead(Request $request)
    {
        $request->user()->notifications()->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas.']);
    }
}
