<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(2)->create();
        // \App\Models\Category::factory(6)->create();
        // \App\Models\Menu::factory(12)->create();

        $this->call([
            OutletSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            UserOutletSeeder::class,
            CategorySeeder::class,
            ModifierSeeder::class,
            ModifierOptionSeeder::class,
            ProductSeeder::class,
            ProductVariantSeeder::class,
            ProductModifierSeeder::class,
            PaymentSeeder::class,
            DiscountSeeder::class,
            ReferralSeeder::class,
            OrderSeeder::class
        ]);
    }

    
}
