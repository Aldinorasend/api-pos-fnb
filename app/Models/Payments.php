<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payments extends Model
{
    use HasFactory;

    protected $primaryKey = "id";

    protected $table = "payments";

    protected $fillable = [
        "payment_name",
        "payment_description",
    ];

}
