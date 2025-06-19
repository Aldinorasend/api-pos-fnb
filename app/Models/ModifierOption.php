<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModifierOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price'
    ];

    public function modifier(){
        return $this->belongsTo(Modifier::class , "modifier_id");
    }
}
