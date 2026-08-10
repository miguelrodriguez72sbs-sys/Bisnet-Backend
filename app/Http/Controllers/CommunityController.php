<?php
namespace App\Http\Controllers;

use App\Events\NotificationCreated;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\CommunityMessage;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CommunityController extends Controller
{
    // VER TODAS LAS COMUNIDADES
    public function index(Request $request)
    {
        $communities = Community::with('owner')
            ->withCount('approvedMembers')
            ->get()
            ->map(function ($community) use ($request) {
                $community->is_member = $community->isMember($request->user()->id);
                $community->is_owner = $community->owner_id === $request->user()->id;
                return $community;
            });

        return response()->json($communities);
    }

    // CREAR COMUNIDAD
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'type'        => 'required|in:public,private',
            'image'       => 'nullable|file|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('communities', 'public');
        }

        $community = Community::create([
            'owner_id'    => $request->user()->id,
            'name'        => $request->name,
            'description' => $request->description,
            'type'        => $request->type,
            'image'       => $imagePath,
        ]);

        // El creador es admin automáticamente
        CommunityMember::create([
            'community_id' => $community->id,
            'user_id'      => $request->user()->id,
            'role'         => 'admin',
            'status'       => 'approved',
        ]);

        return response()->json([
            'message'   => 'Comunidad creada correctamente',
            'community' => $community->load('owner'),
        ], 201);
    }

    // UNIRSE A COMUNIDAD
    public function join(Request $request, $id)
    {
        $community = Community::findOrFail($id);
        $userId = $request->user()->id;

        if ($community->isMember($userId)) {
            return response()->json(['message' => 'Ya eres miembro.'], 409);
        }

        CommunityMember::create([
            'community_id' => $id,
            'user_id'      => $userId,
            'role'         => 'member',
            // Privada = pendiente, pública = aprobado
            'status' => $community->type === 'private' ? 'pending' : 'approved',
        ]);

        // Notificar al dueño de la comunidad
        if ($community->owner_id !== $userId) {
            $notification = Notification::create([
                'user_id'      => $community->owner_id,
                'from_user_id' => $userId,
                'type'         => 'community_join',
                'data'         => [
                    'community_id'   => $community->id,
                    'community_name' => $community->name,
                    'approved'       => $community->type === 'public',
                ],
            ]);

            broadcast(new NotificationCreated($notification))->toOthers();
        }

        return response()->json([
            'message' => $community->type === 'private'
                ? 'Solicitud enviada, esperando aprobación'
                : 'Te uniste a la comunidad',
        ]);
    }

    // SALIR DE COMUNIDAD
    public function leave(Request $request, $id)
    {
        CommunityMember::where('community_id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'Saliste de la comunidad']);
    }

    // VER MIEMBROS
    public function members($id)
    {
        $members = CommunityMember::where('community_id', $id)
            ->where('status', 'approved')
            ->with('user')
            ->get();

        return response()->json($members);
    }

    // VER MENSAJES DEL CHAT
    public function messages($id)
    {
        $messages = CommunityMessage::where('community_id', $id)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    // ENVIAR MENSAJE
    public function sendMessage(Request $request, $id)
    {
        $community = Community::findOrFail($id);

        if (!$community->isMember($request->user()->id)) {
            return response()->json(['message' => 'No eres miembro.'], 403);
        }

        $request->validate(['message' => 'required|string']);

        $message = CommunityMessage::create([
            'community_id' => $id,
            'user_id'      => $request->user()->id,
            'message'      => $request->message,
        ]);

        // Notificar a los demás miembros en tiempo real (Reverb)
        broadcast(new \App\Events\CommunityMessageSent($message))->toOthers();

        // Crear notificación a los demás miembros aprobados
        $memberIds = CommunityMember::where('community_id', $id)
            ->where('status', 'approved')
            ->where('user_id', '!=', $request->user()->id)
            ->pluck('user_id');

        foreach ($memberIds as $memberId) {
            $notification = Notification::create([
                'user_id'      => $memberId,
                'from_user_id' => $request->user()->id,
                'type'         => 'community_message',
                'data'         => [
                    'community_id'   => $community->id,
                    'community_name' => $community->name,
                    'message_id'     => $message->id,
                    'preview'        => Str::limit($message->message, 60),
                ],
            ]);

            broadcast(new NotificationCreated($notification))->toOthers();
        }

        return response()->json($message->load('user'), 201);
    }

    // APROBAR SOLICITUD (solo admin)
    public function approve(Request $request, $communityId, $userId)
    {
        $isAdmin = CommunityMember::where('community_id', $communityId)
            ->where('user_id', $request->user()->id)
            ->where('role', 'admin')
            ->exists();

        if (!$isAdmin) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        CommunityMember::where('community_id', $communityId)
            ->where('user_id', $userId)
            ->update(['status' => 'approved']);

        return response()->json(['message' => 'Miembro aprobado']);
    }
}