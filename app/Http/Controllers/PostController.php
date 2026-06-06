<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    // VER TODAS LAS PUBLICACIONES
    public function index()
    {
        $posts = Post::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($posts);
    }

    // VER MIS PUBLICACIONES
    public function myPosts(Request $request)
    {
        $posts = Post::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

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
        $mediaPath = $request->file('media')
            ->store('posts', 'public');
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

        // Solo el dueño o admin puede borrar
        if ($post->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Publicación eliminada correctamente.']);
    }
}