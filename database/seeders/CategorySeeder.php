<?php

namespace Database\Seeders;

use App\Models\Outlet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $outlet = Outlet::where('outlet_name', 'LAKESIDE')->first();

        DB::table('category')->insert([
            [
                'category_name' => 'COFFEE',
                'outlet_id' => $outlet->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_name' => 'MILK',
                'outlet_id' => $outlet->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_name' => 'MOCKTAIL',
                'outlet_id' => $outlet->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
