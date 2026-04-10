<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\Mission;
use App\Models\ScheduleRestriction;
use App\Models\CategoryRestriction;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuickDemoSeeder extends Seeder
{
    public function run(): void
    {
        $parent = User::find(7);   // Roberto Ochoa Cuevas
        $fabs = User::find(9);     // FabsJR2
        $luis = User::find(17);    // Luis Colunga
        $aldo = User::find(18);    // Aldo Karim

        if (!$parent) {
            $this->command->error('❌ Parent user (ID 7) not found!');
            return;
        }

        // Clean existing demo data
        Expense::whereIn('user_id', [7, 9, 17, 18])->delete();
        Mission::where('parent_id', 7)->delete();
        ScheduleRestriction::whereIn('child_id', [9, 17, 18])->delete();
        CategoryRestriction::whereIn('child_id', [9, 17, 18])->delete();

        // Get categories
        $parentCats = $parent->categories;
        
        if ($parentCats->isEmpty()) {
            $this->command->error('❌ Parent has no categories! Creating them...');
            $parent->ensureDefaultCategories();
            $parentCats = $parent->categories;
        }

        // Create parent expenses
        $this->command->info('💰 Creating parent expenses...');
        $this->createExpenses($parent, $parentCats, [
            ['cat' => 'Alimentación', 'amt' => 450, 'desc' => 'Supermercado Soriana', 'days' => 2],
            ['cat' => 'Transporte', 'amt' => 800, 'desc' => 'Gasolina', 'days' => 3],
            ['cat' => 'Entretenimiento', 'amt' => 350, 'desc' => 'Cine familiar', 'days' => 5],
            ['cat' => 'Salud', 'amt' => 1200, 'desc' => 'Consulta médica', 'days' => 7],
            ['cat' => 'Educación', 'amt' => 2500, 'desc' => 'Colegiatura', 'days' => 10],
            ['cat' => 'Hogar', 'amt' => 650, 'desc' => 'Luz y agua', 'days' => 12],
            ['cat' => 'Alimentación', 'amt' => 280, 'desc' => 'Restaurante', 'days' => 14],
            ['cat' => 'Transporte', 'amt' => 150, 'desc' => 'Uber', 'days' => 15],
            ['cat' => 'Ropa', 'amt' => 890, 'desc' => 'Ropa para los niños', 'days' => 18],
            ['cat' => 'Alimentación', 'amt' => 520, 'desc' => 'Despensa', 'days' => 20],
        ]);

        // Create child expenses
        if ($fabs) {
            $fabsCats = $fabs->categories;
            if ($fabsCats->isEmpty()) {
                $fabs->ensureDefaultCategories();
                $fabsCats = $fabs->categories;
            }
            $this->command->info('💰 Creating FabsJR2 expenses...');
            $this->createRandomExpenses($fabs, $fabsCats, 10);
        }

        if ($luis) {
            $luisCats = $luis->categories;
            if ($luisCats->isEmpty()) {
                $luis->ensureDefaultCategories();
                $luisCats = $luis->categories;
            }
            $this->command->info('💰 Creating Luis expenses...');
            $this->createRandomExpenses($luis, $luisCats, 8);
        }

        if ($aldo) {
            $aldoCats = $aldo->categories;
            if ($aldoCats->isEmpty()) {
                $aldo->ensureDefaultCategories();
                $aldoCats = $aldo->categories;
            }
            $this->command->info('💰 Creating Aldo expenses...');
            $this->createRandomExpenses($aldo, $aldoCats, 8);
        }

        // Create missions
        $this->command->info('🎯 Creating missions...');
        if ($fabs) {
            Mission::create([
                'parent_id' => 7,
                'child_id' => 9,
                'title' => 'Limpiar tu habitación',
                'description' => 'Organizar el closet y tender la cama',
                'reward' => 50.00,
                'status' => 'activa',
            ]);

            Mission::create([
                'parent_id' => 7,
                'child_id' => 9,
                'title' => 'Sacar la basura',
                'description' => 'Toda la semana',
                'reward' => 75.00,
                'status' => 'en_revision',
            ]);
        }

        if ($luis) {
            Mission::create([
                'parent_id' => 7,
                'child_id' => 17,
                'title' => 'Lavar el carro',
                'description' => 'Lavar y aspirar',
                'reward' => 80.00,
                'status' => 'activa',
            ]);
        }

        if ($aldo) {
            Mission::create([
                'parent_id' => 7,
                'child_id' => 18,
                'title' => 'Hacer la tarea',
                'description' => 'Sin recordatorios',
                'reward' => 60.00,
                'status' => 'completada',
            ]);
        }

        // Create restrictions
        if ($fabs) {
            $this->command->info('🚫 Creating restrictions...');
            ScheduleRestriction::create([
                'child_id' => 9,
                'days' => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                'start_time' => '09:00',
                'end_time' => '18:00',
            ]);

            $entCat = $parentCats->firstWhere('name', 'Entretenimiento');
            if ($entCat) {
                CategoryRestriction::create([
                    'child_id' => 9,
                    'category_id' => $entCat->id,
                    'type' => 'limited',
                    'monthly_limit' => 100.00,
                ]);
            }
        }

        $this->command->info('✅ Demo data created!');
        $this->command->info('👨 Parent: neweobgamer@gmail.com');
        $this->command->info('👦 Child 1: hola@gmail.com (FabsJR2)');
        $this->command->info('👦 Child 2: luis@gmail.com');
        $this->command->info('👦 Child 3: aldokarr@gmail.com');
    }

    private function createExpenses($user, $cats, $data): void
    {
        foreach ($data as $d) {
            $cat = $cats->firstWhere('name', $d['cat']);
            if ($cat) {
                Expense::create([
                    'user_id' => $user->id,
                    'category_id' => $cat->id,
                    'amount' => $d['amt'],
                    'description' => $d['desc'],
                    'date' => now()->subDays($d['days'])->toDateString(),
                ]);
            }
        }
    }

    private function createRandomExpenses($user, $cats, $count): void
    {
        $templates = [
            ['cat' => 'Alimentación', 'descs' => ['Lunch', 'Snacks', 'Cafetería']],
            ['cat' => 'Transporte', 'descs' => ['Uber', 'Camión', 'Taxi']],
            ['cat' => 'Entretenimiento', 'descs' => ['Cine', 'Videojuegos']],
            ['cat' => 'Otros', 'descs' => ['Útiles', 'Libro', 'Varios']],
        ];

        for ($i = 0; $i < $count; $i++) {
            $t = $templates[array_rand($templates)];
            $cat = $cats->firstWhere('name', $t['cat']);
            if ($cat) {
                Expense::create([
                    'user_id' => $user->id,
                    'category_id' => $cat->id,
                    'amount' => rand(20, 150),
                    'description' => $t['descs'][array_rand($t['descs'])],
                    'date' => now()->subDays(rand(1, 20))->toDateString(),
                ]);
            }
        }
    }
}
