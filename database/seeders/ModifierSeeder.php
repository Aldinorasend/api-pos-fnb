<?php

namespace Database\Seeders;

use App\Models\Outlet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModifierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('modifiers')->insert([
            [
                'name' => 'Ice',
                'is_required' => true,
                'min_selected' => 1,
                'max_selected' => 2,
                'outlet_id' => Outlet::where('outlet_name', 'LAKESIDE')->first()->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sugar',
                'is_required' => true,
                'min_selected' => 1,
                'max_selected' => 2,
                'outlet_id' => Outlet::where('outlet_name', 'LAKESIDE')->first()->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
