<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('payments')->insert([
            [
                'payment_name' => 'Cash',
                'payment_description' => 'Pembayan yang dilakukan secara tunai',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'payment_name' => 'QrCode (Lakeside)',
                'payment_description' => 'Pembayan yang dilakukan secara digital',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'payment_name' => 'QrCode (Telkom University)',
                'payment_description' => 'Pembayan yang dilakukan secara digital',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
