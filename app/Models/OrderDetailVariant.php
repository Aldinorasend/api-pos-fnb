<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderDetailVariant extends Model
{
    use HasFactory;

    protected $table = 'order_detail_variant';

    protected $fillable =[
        'order_detail_id',
        'variant_name',
        'variant_price'
    ];


    public function order_detail()
    {
        return $this->belongsTo(OrderDetail::class, "order_detail_id");
    }
}
