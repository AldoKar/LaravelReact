<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CategoryRestriction;
use App\Models\Expense;
use App\Models\Mission;
use App\Models\ScheduleRestriction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds for hackathon demo.
     */
    public function run(): void
    {
        // Create parent user
        $parent = User::create([
            'name' => 'Roberto Ochoa',
            'email' => 'roberto@capitallife.com',
            'password' => Hash::make('password'),
            'role' => 'parent',
            'balance' => 5000.00,
            'phone' => '+52 81 1234 5678',
        ]);

        // Create default categories for parent
        $parent->ensureDefaultCategories();
        $parentCategories = $parent->categories;

        // Create child 1: Sofia
        $sofia = User::create([
            'name' => 'Sofia Ochoa',
            'email' => 'sofia@capitallife.com',
            'password' => Hash::make('password'),
            'role' => 'child',
            'parent_id' => $parent->id,
            'balance' => 250.00,
        ]);
        $sofia->ensureDefaultCategories();
        $sofiaCategories = $sofia->categories;

        // Create child 2: Fabian
        $fabian = User::create([
            'name' => 'Fabian Ochoa Jr',
            'email' => 'fabian@capitallife.com',
            'password' => Hash::make('password'),
            'role' => 'child',
            'parent_id' => $parent->id,
            'balance' => 180.00,
        ]);
        $fabian->ensureDefaultCategories();
        $fabianCategories = $fabian->categories;

        // Create expenses for parent (last 30 days)
        $this->createParentExpenses($parent, $parentCategories);

        // Create expenses for Sofia (last 15 days)
        $this->createChildExpenses($sofia, $sofiaCategories, 15);

        // Create expenses for Fabian (last 20 days)
        $this->createChildExpenses($fabian, $fabianCategories, 12);

        // Create schedule restriction for Sofia (weekdays 9am-6pm)
        ScheduleRestriction::create([
            'child_id' => $sofia->id,
            'days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'start_time' => '09:00',
            'end_time' => '18:00',
        ]);

        // Create category restrictions for Sofia
        $entertainmentCategory = $parentCategories->firstWhere('name', 'Entretenimiento');
        if ($entertainmentCategory) {
            CategoryRestriction::create([
                'child_id' => $sofia->id,
                'category_id' => $entertainmentCategory->id,
                'type' => 'limited',
                'monthly_limit' => 100.00,
            ]);
        }

        // Create category restrictions for Fabian (block Entertainment)
        $fabianEntertainment = $parentCategories->firstWhere('name', 'Entretenimiento');
        if ($fabianEntertainment) {
            CategoryRestriction::create([
                'child_id' => $fabian->id,
                'category_id' => $fabianEntertainment->id,
                'type' => 'blocked',
            ]);
        }

        // Create missions
        $this->createMissions($parent, $sofia, $fabian);

        $this->command->info('✅ Demo data seeded successfully!');
        $this->command->info('👨 Parent: roberto@capitallife.com / password');
        $this->command->info('👧 Child 1: sofia@capitallife.com / password');
        $this->command->info('👦 Child 2: fabian@capitallife.com / password');
    }

    private function createParentExpenses(User $parent, $categories): void
    {
        $expenseData = [
            ['category' => 'Alimentación', 'amount' => 450.00, 'description' => 'Supermercado Soriana', 'days_ago' => 2],
            ['category' => 'Transporte', 'amount' => 800.00, 'description' => 'Gasolina', 'days_ago' => 3],
            ['category' => 'Entretenimiento', 'amount' => 350.00, 'description' => 'Cine familiar', 'days_ago' => 5],
            ['category' => 'Salud', 'amount' => 1200.00, 'description' => 'Consulta médica', 'days_ago' => 7],
            ['category' => 'Educación', 'amount' => 2500.00, 'description' => 'Colegiatura', 'days_ago' => 10],
            ['category' => 'Hogar', 'amount' => 650.00, 'description' => 'Luz y agua', 'days_ago' => 12],
            ['category' => 'Alimentación', 'amount' => 280.00, 'description' => 'Restaurante', 'days_ago' => 14],
            ['category' => 'Transporte', 'amount' => 150.00, 'description' => 'Uber', 'days_ago' => 15],
            ['category' => 'Ropa', 'amount' => 890.00, 'description' => 'Ropa para los niños', 'days_ago' => 18],
            ['category' => 'Alimentación', 'amount' => 520.00, 'description' => 'Despensa', 'days_ago' => 20],
            ['category' => 'Entretenimiento', 'amount' => 200.00, 'description' => 'Netflix y Spotify', 'days_ago' => 22],
            ['category' => 'Otros', 'amount' => 180.00, 'description' => 'Regalos', 'days_ago' => 25],
        ];

        foreach ($expenseData as $data) {
            $category = $categories->firstWhere('name', $data['category']);
            if ($category) {
                Expense::create([
                    'user_id' => $parent->id,
                    'category_id' => $category->id,
                    'amount' => $data['amount'],
                    'description' => $data['description'],
                    'date' => now()->subDays($data['days_ago'])->toDateString(),
                ]);
            }
        }
    }

    private function createChildExpenses(User $child, $categories, int $count): void
    {
        $expenseTemplates = [
            ['category' => 'Alimentación', 'descriptions' => ['Lunch en la escuela', 'Snacks', 'Cafetería', 'Comida rápida']],
            ['category' => 'Transporte', 'descriptions' => ['Uber a casa', 'Camión', 'Taxi']],
            ['category' => 'Entretenimiento', 'descriptions' => ['Cine con amigos', 'Videojuegos', 'Concierto']],
            ['category' => 'Otros', 'descriptions' => ['Útiles escolares', 'Libro', 'Varios']],
        ];

        for ($i = 0; $i < $count; $i++) {
            $template = $expenseTemplates[array_rand($expenseTemplates)];
            $category = $categories->firstWhere('name', $template['category']);
            
            if ($category) {
                Expense::create([
                    'user_id' => $child->id,
                    'category_id' => $category->id,
                    'amount' => rand(20, 150) + (rand(0, 99) / 100),
                    'description' => $template['descriptions'][array_rand($template['descriptions'])],
                    'date' => now()->subDays(rand(1, 20))->toDateString(),
                ]);
            }
        }
    }

    private function createMissions(User $parent, User $sofia, User $fabian): void
    {
        // Active mission for Sofia
        Mission::create([
            'parent_id' => $parent->id,
            'child_id' => $sofia->id,
            'title' => 'Limpiar tu habitación',
            'description' => 'Organizar el closet, tender la cama y aspirar el piso',
            'reward' => 50.00,
            'status' => 'activa',
        ]);

        // Mission in review for Sofia
        Mission::create([
            'parent_id' => $parent->id,
            'child_id' => $sofia->id,
            'title' => 'Sacar la basura toda la semana',
            'description' => 'Sacar la basura todos los días de lunes a viernes',
            'reward' => 75.00,
            'status' => 'en_revision',
        ]);

        // Completed mission for Sofia
        Mission::create([
            'parent_id' => $parent->id,
            'child_id' => $sofia->id,
            'title' => 'Ayudar con la comida',
            'description' => 'Preparar la cena el fin de semana',
            'reward' => 100.00,
            'status' => 'completada',
            'created_at' => now()->subDays(7),
            'updated_at' => now()->subDays(5),
        ]);

        // Active mission for Fabian
        Mission::create([
            'parent_id' => $parent->id,
            'child_id' => $fabian->id,
            'title' => 'Lavar el carro',
            'description' => 'Lavar y aspirar el carro familiar',
            'reward' => 80.00,
            'status' => 'activa',
        ]);

        // Completed mission for Fabian
        Mission::create([
            'parent_id' => $parent->id,
            'child_id' => $fabian->id,
            'title' => 'Hacer la tarea sin recordatorios',
            'description' => 'Completar toda la tarea de la semana sin que te lo recuerden',
            'reward' => 60.00,
            'status' => 'completada',
            'created_at' => now()->subDays(10),
            'updated_at' => now()->subDays(8),
        ]);

        // Rejected mission for Fabian
        Mission::create([
            'parent_id' => $parent->id,
            'child_id' => $fabian->id,
            'title' => 'Ordenar el garaje',
            'description' => 'Organizar las herramientas y limpiar el garaje',
            'reward' => 120.00,
            'status' => 'activa',
            'reject_reason' => 'El garaje no quedó completamente ordenado',
            'created_at' => now()->subDays(3),
        ]);
    }
}
