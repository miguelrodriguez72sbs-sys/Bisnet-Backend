<?php 
 namespace App\Models;

 use Illuminate\Database\Eloquent\Factories\HasFactory;
 use Illuminate\Database\Eloquent\Model;

 class Post extends Model
 {
     use HasFactory;

     protected $fillable = [
         'user_id',
         'title',
         'description',
         'image',
         'media_path',
     ];

     // Relación: un post pertenece a un usuario
     public function user()
     {
         return $this->belongsTo(User::class);
     }
     // app/Models/Post.php
//Relacion entre el post y los likes
public function likes()
{
    return $this->hasMany(Like::class);
}

public function isLikedBy($userId)
{
    return $this->likes()->where('user_id', $userId)->exists();
}
 }