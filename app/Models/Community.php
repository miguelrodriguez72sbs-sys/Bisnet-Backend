<?php 
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Community extends Model
{
    protected $fillable = ['owner_id', 'name', 'description', 'image', 'type'];

    public function owner() {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members() {
        return $this->hasMany(CommunityMember::class);
    }

    public function approvedMembers() {
        return $this->hasMany(CommunityMember::class)
            ->where('status', 'approved');
    }

    public function messages() {
        return $this->hasMany(CommunityMessage::class);
    }

    public function isMember($userId) {
        return $this->approvedMembers()
            ->where('user_id', $userId)->exists();
    }
}