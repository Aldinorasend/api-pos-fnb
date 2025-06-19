<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            [
                'name' => 'ADMIN',
                'email' => 'admin@email.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => 1,
                'remember_token' => \Illuminate\Support\Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'MANAGER',
                'email' => 'manager@email.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => 2,
                'remember_token' => \Illuminate\Support\Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'STAFF',
                'email' => 'staff@email.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role_id' => 3,
                'remember_token' => \Illuminate\Support\Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
