<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $categories = [
            'Groceries',
            'Dining Out',
            'Coffee & Snacks',
            'Fuel & Vehicle Care',
            'Public Transit & Rideshare',
            'Rent or Mortgage',
            'Utilities',
            'Digital Services',
            'Home Maintenance',
            'Medical & Pharmacy',
            'Fitness & Wellness',
            'Personal Care',
            'Subscriptions & Streaming',
            'Social & Events',
            'Clothing & Accessories',
            'Hobbies',
            'Education & Training',
            'Books & Media',
            'Debt & Interest',
            'Gifts & Donations',
        ];

        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement($categories),
            'icon' => fake()->optional()->word(),
        ];
    }
}