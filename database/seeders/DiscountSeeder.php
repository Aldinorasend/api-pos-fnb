<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DiscountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('discounts')->insert([
            [
                'name' => '10% Off',
                'type' => 'percent',
                'amount' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '30% Off',
                'type' => 'percent',
                'amount' => 30,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '15K Off',
                'type' => 'fixed',
                'amount' => 15000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
