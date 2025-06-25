<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\SoftDeletes;

class Outlet extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $guarded = ['id'];
    public $incrementing = false;
    protected $table = 'outlet';

    protected $fillable = [
        'id',
        'outlet_name',
        'email',
        'image',
        'latitude',
        'longitude',
        'is_active',
        'is_dinein',
        'is_label',
        'is_kitchen'
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_outlet', 'outlet_id', 'user_id')
                    ->select('users.id', 'users.role_id', 'users.name', 'users.email')
                    ->withTimestamps();
    }

    protected static function boot()
    {
        parent::boot();

        // Event listener for the creating event
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = $model->generateUniqueId();
            }
        });
    }

    /**
     * Generate a unique ID for the Outlet.
     *
     * @return string
     */
    protected function generateUniqueId(): string
    {
        do {
            $randomNumber = Str::upper(Str::random(10)); // Generate a 10-character random string
            $uniqueId = 'OUT-' . $randomNumber; // Prefix with 'OUT-'
        } while (self::where('id', $uniqueId)->exists()); // Ensure uniqueness

        return $uniqueId;
    }
}
