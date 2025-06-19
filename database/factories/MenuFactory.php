<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MenuFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $menu_items = [
            
                "menu_name" => "Ice Salted Caramel Latte",
                "menu_price" => 24000
            
        ];


        return [
            "category_id" => rand(0,6),
            "menu_name" => $menu_items["menu_name"],
            "menu_price" => $menu_items["menu_price"]
        ];
    
    }
}
