<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserOutlet extends Pivot
{
    // use HasFactory;

    // protected $table = 'user_outlet';

    // protected $fillable = [
    //     'user_id',
    //     'outlet_id',
    // ];

    protected $table = 'user_outlet';
}
