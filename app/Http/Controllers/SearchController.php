<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use App\Models\Estadia;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    // BÚSQUEDA GLOBAL: usuarios, publicaciones y estadías
    public function index(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:1',
        ]);

        $q = $request->query('q');
        $userId = $request->user()->id;

        $users = User::where('name', 'like', "%{$q}%")
            ->orWhere('career', 'like', "%{$q}%")
            ->select('id', 'name', 'career', 'profile_photo')
            ->limit(10)
            ->get();

        $posts = Post::with('user')
            ->withCount('likes')
            ->where('title', 'like', "%{$q}%")
            ->orWhere('description', 'like', "%{$q}%")
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->each(function ($post) use ($userId) {
                $post->liked_by_me = $post->isLikedBy($userId);
            });

        $estadias = Estadia::where('empresa', 'like', "%{$q}%")
            ->orWhere('giro', 'like', "%{$q}%")
            ->orWhere('carrera', 'like', "%{$q}%")
            ->orderBy('empresa')
            ->limit(10)
            ->get();

        return response()->json([
            'users'    => $users,
            'posts'    => $posts,
            'estadias' => $estadias,
        ]);
    }
}
