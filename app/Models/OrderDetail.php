<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    use HasFactory;

    protected $guarded =['id'];

    public function modifiers()
    {
        return $this->hasMany(OrderDetailModifier::class, 'order_detail_id', 'id');
    }

    public function variants()
    {
        return $this->hasOne(OrderDetailVariant::class, 'order_detail_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
