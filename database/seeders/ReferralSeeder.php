<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReferralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('referral_code')->insert([
            [
                'code' => 'CAATIS2024',
                'description' => 'caatis referral',
                'expired_date' => '2029-07-31',
                'discount' => '10',
                'quotas' => '50',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
