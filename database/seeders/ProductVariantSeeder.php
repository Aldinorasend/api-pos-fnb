<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductVariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('product_variants')->insert([
            [
                'product_id' => Product::first()->id,
                'name' => 'default',
                'price' => '24000',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => Product::skip(1)->first()->id,
                'name' => 'HOT',
                'price' => '20000',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => Product::skip(1)->first()->id,
                'name' => 'ICED',
                'price' => '20000',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
