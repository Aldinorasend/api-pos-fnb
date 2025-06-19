<?php

namespace Database\Seeders;

use App\Models\Outlet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('products')->insert([
            [
                'name' => 'Salted Caramel Latte',
                'category_id' => 1,
                'description' => 'kopi',
                'is_active' => 1,
                'outlet_id' => Outlet::where('outlet_name', 'LAKESIDE')->first()->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Salted Caramel Milk',
                'category_id' => 2,
                'description' => 'susu',
                'is_active' => 1,
                'outlet_id' => Outlet::where('outlet_name', 'LAKESIDE')->first()->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
        ]);
    }
}
