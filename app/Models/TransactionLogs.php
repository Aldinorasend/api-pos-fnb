<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionLogs extends Model
{
    use HasFactory;

    protected $table = "transaction_logs";

    protected $fillable = [
        "customer_id",
        "order_id",
        "response"
    ];
}
