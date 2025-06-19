<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Order extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected $table = "order";

    public $incrementing = false;

    protected $KeyType = "string";

    protected $fillable = [
        "id",
        'outlet_id',
        'customer_id',
        "order_subtotal",
        "order_total",
        "order_payment",
        "order_type",
        "order_table",
        'discount_id',
        'referral_code_id',
        "order_cashier",
        "created_at",
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class, 'outlet_id', 'id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'id');
    }

    public function order_details()
    {
        return $this->hasMany(OrderDetail::class);
    }

    public function payment()
    {
        return $this->belongsTo(Payments::class, 'order_payment', 'id');
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'order_cashier', 'id');
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class, 'discount_id', 'id');
    }

    public function referral()
    {
        return $this->belongsTo(ReferralCode::class, 'referral_code_id', 'id');
    }
}
