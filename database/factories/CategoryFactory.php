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

    public const CATEGORY_NAMES = [
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
        'Family',
    ];

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(self::CATEGORY_NAMES),
            'icon' => fake()->optional()->word(),
        ];
    }
}