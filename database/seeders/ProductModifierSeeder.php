<?php

namespace Database\Seeders;

use App\Models\Modifier;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductModifierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('product_modifiers')->insert([
            [     
                'product_id' => Product::first()->id,
                'modifier_id' => Modifier::first()->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
