<?php

namespace App\Events;

use App\Models\CommunityMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommunityMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public CommunityMessage $message;

    public function __construct(CommunityMessage $message)
    {
        $this->message = $message->load('user');
    }

    // Canal privado de la comunidad: solo los miembros autorizados pueden escucharlo
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('community.' . $this->message->community_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'id'           => $this->message->id,
            'community_id' => $this->message->community_id,
            'user_id'      => $this->message->user_id,
            'user'         => $this->message->user,
            'message'      => $this->message->message,
            'created_at'   => $this->message->created_at,
        ];
    }
}
