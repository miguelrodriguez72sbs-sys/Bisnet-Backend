<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PostController;
use App\Http\Controllers\EstadiaController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Broadcast;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class,   'logout']);
    Route::get('/me',      [AuthController::class,   'me']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto']);
    Route::get('/search', [SearchController::class, 'index']);


    // Autorización de canales privados (usa el token Sanctum, no la sesión web)
    Route::post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
        return Broadcast::auth($request);
    });

    // Notificaciones
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    // Chat
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/{userId}', [MessageController::class, 'show']);
    Route::post('/messages/{userId}', [MessageController::class, 'store']);

    //publicaciones - posts
    Route::get('/posts',        [PostController::class, 'index']);
    Route::get('/posts/my',     [PostController::class, 'myPosts']);
    Route::post('/posts',       [PostController::class, 'store']);
    Route::delete('/posts/{id}',[PostController::class, 'destroy']);
    //estadias
    Route::get('/estadias',      [EstadiaController::class, 'index']);
    Route::get('/estadias/{id}', [EstadiaController::class, 'show']);
    });
    //rutas de filtro de usuarios para estadias
    Route::middleware(['auth:sanctum', 'correo.institucional'])->group(function () {
    Route::get('/estadias',      [EstadiaController::class, 'index']);
    Route::get('/estadias/{id}', [EstadiaController::class, 'show']);

    //Ruta para dar/quitar like a una publicación
    Route::post('/posts/{id}/like', [PostController::class, 'toggleLike']);

    });
    Route::middleware('auth:sanctum')->group(function () {
    // Comunidades
    Route::get('/communities', [CommunityController::class, 'index']);
    Route::post('/communities', [CommunityController::class, 'store']);
    Route::post('/communities/{id}/join', [CommunityController::class, 'join']);
    Route::delete('/communities/{id}/leave', [CommunityController::class, 'leave']);
    Route::get('/communities/{id}/members', [CommunityController::class, 'members']);
    Route::get('/communities/{id}/messages', [CommunityController::class, 'messages']);
    Route::post('/communities/{id}/messages', [CommunityController::class, 'sendMessage']);
    Route::post('/communities/{communityId}/approve/{userId}', [CommunityController::class, 'approve']);
    });
