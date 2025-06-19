<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    use HasFactory;

    protected $table = 'discounts';

    protected $fillable = [
        'name', 'type', 'amount'
    ];

    public function outlets()
    {
        return $this->belongsToMany(Outlet::class, 'discount_outlet', 'discount_id', 'outlet_id')
                    ->withTimestamps();
    }
}
