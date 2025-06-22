<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReferralCode extends Model
{
    use HasFactory;
    use SoftDeletes;
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
