<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OutletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('outlet')->insert([
            [
                'id' => 'OUT-' . Str::upper(Str::random(10)),
                'outlet_name' => 'LAKESIDE',
                'email' => 'lakeside@lakesidefnb.com',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "id" => "OUT-". Str::upper(Str::random(10)),
                "outlet_name" => "LITERASI",
                "email" => "literasi@lakesidefnb.com",
                "is_active" => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                "id" => "OUT-". Str::upper(Str::random(10)),
                "outlet_name" => "LAKESIDE FIT",
                "email" => "lakesidefit@lakesidefnb.com",
                "is_active" => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
