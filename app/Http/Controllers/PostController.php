<?php

namespace App\Http\Controllers;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\Post;
use App\Models\Like;
use Illuminate\Http\Request;

class PostController extends Controller
{
    // VER TODAS LAS PUBLICACIONES (público: también funciona para invitados)
    public function index(Request $request)
    {
        $userId = $request->user()?->id;

        $posts = Post::with('user')
            ->withCount('likes') //cuenta total de likes
            ->orderBy('created_at', 'desc')
            ->get();

        //marca si el usuario actual ya dio like
        $posts->each(function ($post) use ($userId) {
            $post->liked_by_me = $userId !== null && $post->isLikedBy($userId);
        });

        return response()->json($posts);
    }

    // VER MIS PUBLICACIONES
    public function myPosts(Request $request)
    {
        $userId = $request->user()->id;

        $posts = Post::where('user_id', $userId)
            ->withCount('likes')
            ->orderBy('created_at', 'desc')
            ->get();

        $posts->each(function ($post) use ($userId) {
            $post->liked_by_me = $post->isLikedBy($userId);
        });

        return response()->json($posts);
    }

    // CREAR PUBLICACIÓN
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'media' => 'nullable|file|max:20480'
        ]);

        $mediaPath = null;

        if ($request->hasFile('media')) {
            $mediaPath = $request->file('media')->store('posts', 'public');
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'media_path' => $mediaPath,
        ]);

        return response()->json([
            'message' => 'Publicación creada correctamente',
            'post' => $post->load('user')
        ], 201);
    }

    // BORRAR PUBLICACIÓN
    public function destroy(Request $request, $id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['message' => 'Publicación no encontrada.'], 404);
        }

        if ($post->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Publicación eliminada correctamente.']);
    }

    // NUEVO: DAR/QUITAR LIKE (toggle)
    public function toggleLike(Request $request, $id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['message' => 'Publicación no encontrada.'], 404);
        }

        $userId = $request->user()->id;
        $existingLike = Like::where('user_id', $userId)
            ->where('post_id', $id)
            ->first();

        if ($existingLike) {
            // Ya tenía like → lo quita
            $existingLike->delete();
            $liked = false;
        } else {
            // No tenía like → lo agrega
            Like::create(['user_id' => $userId, 'post_id' => $id]);
            $liked = true;

                    // Solo notifica si no te das like a ti mismo
            if ($post->user_id !== $userId) {
                $notification = Notification::create([
                    'user_id'      => $post->user_id,
                    'from_user_id' => $userId,
                    'type'         => 'like',
                    'data'         => [
                        'post_id'    => $post->id,
                        'post_title' => $post->title,
                    ],
                ]);

                broadcast(new NotificationCreated($notification))->toOthers();
            }
        }

        $totalLikes = $post->likes()->count();

        return response()->json([
            'liked' => $liked,
            'likes_count' => $totalLikes,
        ]);
    }
}
