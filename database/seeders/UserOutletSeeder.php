<?php

namespace Database\Seeders;

use App\Models\Outlet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserOutletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $outlet = Outlet::where('outlet_name', 'LAKESIDE')->first();
        
        DB::table('user_outlet')->insert([
            [
                'user_id' => User::first()->id,
                'outlet_id' => $outlet->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => User::skip(1)->first()->id,
                'outlet_id' => $outlet->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => User::skip(2)->first()->id,
                'outlet_id' => $outlet->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}