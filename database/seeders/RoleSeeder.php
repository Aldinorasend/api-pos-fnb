<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('roles')->insert([
            [
                'role' => 'Administrator',
                'description' => 'Administrator',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role' => 'Manager',
                'description' => 'Manager',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role' => 'Staff',
                'description' => 'Staff',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
