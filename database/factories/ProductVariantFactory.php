<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'product_id' => $this->faker->randomElement([1,2,3]),
            'name' => $this->faker->userName,
            'price' => $this->faker->numberBetween(10000, 50000)
        ];
    }
}
