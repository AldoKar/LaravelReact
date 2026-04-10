<?php

namespace App\Ai\Tools;

use App\Models\User;
use App\Models\Category;
use App\Models\Expense;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class RegisterExpenseTool implements Tool
{
    public function __construct(protected User $user) {}

    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Registra un nuevo gasto financiero para el usuario. Réstale el monto a su saldo y guarda su historial.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $amount = (float) $request->argument('amount');
        $categoryName = $request->argument('category');
        $description = $request->argument('description', '');

        // Find or create category
        $category = Category::firstOrCreate([
            'user_id' => $this->user->id,
            'name' => $categoryName,
        ]);

        // Insert Expense
        Expense::create([
            'user_id' => $this->user->id,
            'category_id' => $category->id,
            'amount' => $amount,
            'description' => $description,
            'date' => now()->toDateString(),
        ]);

        // Deduct balance
        $this->user->balance -= $amount;
        $this->user->save();

        return "Gasto de \${$amount} registrado con éxito en '{$categoryName}'. El nuevo saldo del usuario es \${$this->user->balance}.";
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'amount' => $schema->number()->required()->description('El monto del gasto.'),
            'category' => $schema->string()->required()->description('El tipo o nombre de la categoría del gasto (ej. Alimentación, Transporte, Entretenimiento).'),
            'description' => $schema->string()->description('Breve detalle o descripción del gasto.'),
        ];
    }
}
