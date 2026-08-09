<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\NotificationCreated;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    // LISTA DE CONVERSACIONES (último mensaje con cada persona con la que has hablado)
    public function conversations(Request $request)
    {
        $myId = $request->user()->id;

        // IDs de todos los usuarios con los que ha habido intercambio de mensajes
        $otherIds = Message::where('sender_id', $myId)
            ->orWhere('receiver_id', $myId)
            ->get()
            ->map(fn ($m) => $m->sender_id === $myId ? $m->receiver_id : $m->sender_id)
            ->unique();

        $conversations = $otherIds->map(function ($otherId) use ($myId) {
            $other = User::select('id', 'name', 'career', 'profile_photo')->find($otherId);
            $lastMessage = Message::where(function ($q) use ($myId, $otherId) {
                $q->where('sender_id', $myId)->where('receiver_id', $otherId);
            })->orWhere(function ($q) use ($myId, $otherId) {
                $q->where('sender_id', $otherId)->where('receiver_id', $myId);
            })->orderBy('created_at', 'desc')->first();

            $unreadCount = Message::where('sender_id', $otherId)
                ->where('receiver_id', $myId)
                ->whereNull('read_at')
                ->count();

            return [
                'user'          => $other,
                'last_message'  => $lastMessage,
                'unread_count'  => $unreadCount,
            ];
        })->filter(fn ($c) => $c['user'] !== null)
          ->sortByDesc(fn ($c) => $c['last_message']?->created_at)
          ->values();

        return response()->json($conversations);
    }

    // MENSAJES CON UN USUARIO ESPECÍFICO
    public function show(Request $request, $userId)
    {
        $myId = $request->user()->id;

        $messages = Message::where(function ($q) use ($myId, $userId) {
            $q->where('sender_id', $myId)->where('receiver_id', $userId);
        })->orWhere(function ($q) use ($myId, $userId) {
            $q->where('sender_id', $userId)->where('receiver_id', $myId);
        })->orderBy('created_at', 'asc')->get();

        // Marca como leídos los mensajes que me enviaron
        Message::where('sender_id', $userId)
            ->where('receiver_id', $myId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json($messages);
    }

    // ENVIAR UN MENSAJE
    public function store(Request $request, $userId)
    {
        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $receiver = User::find($userId);
        if (!$receiver) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $sender = $request->user();

        $message = Message::create([
            'sender_id'   => $sender->id,
            'receiver_id' => $receiver->id,
            'body'        => $request->body,
        ]);

        broadcast(new MessageSent($message))->toOthers();

        // Crea y transmite la notificación al receptor
        $notification = Notification::create([
            'user_id'      => $receiver->id,
            'from_user_id' => $sender->id,
            'type'         => 'message',
            'data'         => [
                'message_id' => $message->id,
                'preview'    => \Illuminate\Support\Str::limit($message->body, 60),
            ],
        ]);

        broadcast(new NotificationCreated($notification))->toOthers();

        return response()->json($message, 201);
    }
}
