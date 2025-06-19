<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        "name",
        "category_id",
        "description",
        "image",
        "is_active",
        "outlet_id"
    ];

    public function modifiers(){
        return $this->belongsToMany(Modifier::class, 'product_modifiers')->with('modifierOptions');
    }

    public function outlet(){
        return $this->belongsTo(Outlet::class,'outlet_id');
    }

    public function variants(){
        return $this->hasMany(ProductVariant::class, 'product_id');
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }
}
