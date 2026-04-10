<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
            ]
        );

        $user->update([
            'name' => 'Test User',
            'password' => 'password',
        ]);

        $user->expenses()->delete();
        $user->categories()->delete();
        $user->ensureDefaultCategories();

        Expense::factory()
            ->count(20)
            ->for($user)
            ->create();
    }
}
