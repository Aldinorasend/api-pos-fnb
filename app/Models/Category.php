<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $table = "category";

    protected $fillable = [
        "category_name",
        "is_food",
        "outlet_id"
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
}