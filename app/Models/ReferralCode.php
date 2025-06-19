<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralCode extends Model
{
    use HasFactory;

    protected $table = "referral_code";

    protected $fillable = [
        "code",
        "description",
        "expired_date",
        "discount",
        "quotas",
        "is_active"  
    ];
}
