<?php

namespace Database\Seeders;

use App\Models\Modifier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModifierOptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('modifier_options')->insert([
            [
                'modifier_id' => Modifier::first()->id,
                'name' => 'Less Ice',
                'price' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'modifier_id' => Modifier::first()->id,
                'name' => 'No Ice',
                'price' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'modifier_id' => Modifier::skip(1)->first()->id,
                'name' => 'Less Sugar',
                'price' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'modifier_id' => Modifier::skip(1)->first()->id,
                'name' => 'No Sugar',
                'price' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
