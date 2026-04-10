<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CategoryRestriction;
use App\Models\Expense;
use App\Models\Mission;
use App\Models\ScheduleRestriction;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed demo data for existing users (IDs 13, 14, 15).
     */
    public function run(): void
    {
        // Get existing users
        $parent = User::find(13); // Roberto
        $sofia = User::find(14);  // Sofia
        $fabian = User::find(15); // Fabian

        if (!$parent || !$sofia || !$fabian) {
            $this->command->error('❌ Users not found! Make sure IDs 13, 14, 15 exist.');
            return;
        }

        // Update balances
        $parent->update(['balance' => 5000.00]);
        $sofia->update(['balance' => 250.00]);
        $fabian->update(['balance' => 180.00]);

        // Get categories
        $parentCategories = $parent->categories;
        $sofiaCategories = $sofia->categories;
        $fabianCategories = $fabian->categories;

        // Clear existing demo data
        $this->command->info('🧹 Cleaning existing demo data...');
        Expense::whereIn('user_id', [13, 14, 15])->delete();
        Mission::where('parent_id', 13)->delete();
        ScheduleRestriction::whereIn('child_id', [14, 15])->delete();
        CategoryRestriction::whereIn('child_id', [14, 15])->delete();

        // Create expenses
        $this->command->info('💰 Creating expenses...');
        $this->createParentExpenses($parent, $parentCategories);
        $this->createChildExpenses($sofia, $sofiaCategories, 15);
        $this->createChildExpenses($fabian, $fabianCategories, 12);

        // Create schedule restriction for Sofia
        $this->command->info('⏰ Creating schedule restrictions...');
        ScheduleRestriction::create([
            'child_id' => $sofia->id,
            'days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            'start_time' => '09:00',
            'end_time' => '18:00',
        ]);

        // Create category restrictions
        $this->command->info('🚫 Creating category restrictions...');
        $entertainmentCategory = $parentCategories->firstWhere('name', 'Entretenimiento');
        if ($entertainmentCategory) {
            CategoryRestriction::create([
                'child_id' => $sofia->id,
                'category_id' => $entertainmentCategory->id,
                'type' => 'limited',
                'monthly_limit' => 100.00,
            ]);

            CategoryRestriction::create([
                'child_id' => $fabian->id,
                'category_id' => $entertainmentCategory->id,
                'type' => 'blocked',
            ]);
        }

        // Create missions
        $this->command->info('🎯 Creating missions...');
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
