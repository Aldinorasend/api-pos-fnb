<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Modifier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'is_required',
        'min_selected',
        'max_selected',
        'outlet_id',
    ];

    public function products(){
        return $this->belongsToMany(Product::class, 'product_modifiers');
    }

    public function modifierOptions(){
        return $this->hasMany(ModifierOption::class);
    }

    public function productsModifier(){
        return $this->hasMany(ProductModifier::class , "modifier_id");
    }
}
