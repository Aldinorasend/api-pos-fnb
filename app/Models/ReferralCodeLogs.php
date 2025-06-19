<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralCodeLogs extends Model
{
    use HasFactory;

    protected $table = "referral_code_logs";

    protected $fillable = [
        "referral_code_id",
        "order_id"
    ];
}
