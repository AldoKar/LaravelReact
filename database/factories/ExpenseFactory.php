<?php

namespace Database\Factories;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<Expense>
     */
    protected $model = Expense::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => null,
            'amount' => fake()->randomFloat(2, 1, 5000),
            'description' => fake()->optional()->sentence(),
            'date' => fake()->dateTimeBetween('first day of last month', 'last day of last month')->format('Y-m-d'),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Expense $expense): void {
            $category = $expense->user->categories()->inRandomOrder()->first();

            if ($category === null) {
                $category = $expense->user->categories()->create([
                    'name' => fake()->randomElement([
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
                    ]),
                    'icon' => null,
                ]);
            }

            $expense->category()->associate($category);
            $expense->save();
        });
    }
}
