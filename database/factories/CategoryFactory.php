<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $menu_category = [
            "Coffee",
            "Tea",
            "Milk",
            "Mojito",
            "Sweet"
        ];

         
        return [
            "category_name" => $menu_category[rand(0,4)]
        ];
    }
}
