<?php

use Illuminate\Support\Facades\Broadcast;

// Solo el propio usuario puede escuchar su canal de notificaciones
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Solo los dos usuarios de la conversación pueden escuchar su canal de chat
Broadcast::channel('chat.{userIdA}.{userIdB}', function ($user, $userIdA, $userIdB) {
    return (int) $user->id === (int) $userIdA || (int) $user->id === (int) $userIdB;
});
