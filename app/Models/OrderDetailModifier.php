<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderDetailModifier extends Model
{
    use HasFactory;

    protected $table ='order_detail_modifiers';

    protected $guarded = ['id'];

    public function order_detail()
    {
        return $this->belongsTo(OrderDetail::class, "order_detail_id");
    }
}
