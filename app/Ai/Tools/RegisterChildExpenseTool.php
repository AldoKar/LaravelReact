<?php

namespace App\Ai\Tools;

use App\Models\User;
use App\Models\Category;
use App\Models\Expense;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class RegisterChildExpenseTool implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): Stringable|string
    {
        return 'Permite registrar un nuevo gasto a nombre de uno de los hijos del usuario. Usar cuando el usuario pida agregar un gasto (expense) de sus hijos.';
    }

    public function handle(Request $request): Stringable|string
    {
        $childName = (string) ($request['child_name'] ?? '');
        $amount = (float) ($request['amount'] ?? 0);
        $categoryName = (string) ($request['category'] ?? '');
        $description = (string) ($request['description'] ?? '');

        // Buscar al hijo por nombre de manera flexible
        $child = $this->user->children()->where('name', 'ilike', '%' . $childName . '%')->first();

        if (!$child) {
            return "No se ha encontrado un hijo con el nombre '{$childName}'. Pídele al usuario que verifique el nombre de sus hijos.";
        }

        // Buscar o crear la categoría (pero local para el hijo)
        $category = Category::firstOrCreate([
            'user_id' => $child->id,
            'name' => $categoryName,
        ]);

        Expense::create([
            'user_id' => $child->id,
            'category_id' => $category->id,
            'amount' => $amount,
            'description' => $description,
            'date' => now()->toDateString(),
        ]);

        $child->balance -= $amount;
        $child->save();

        return "Gasto de \${$amount} registrado con éxito en '{$categoryName}' para el hijo '{$child->name}'. Su nuevo saldo es \${$child->balance}.";
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'child_name' => $schema->string()->required()->description('El nombre de pila del hijo que realizó el gasto. Si no lo sabes, pregúntaselo al usuario.'),
            'amount' => $schema->number()->required()->description('El monto numérico del gasto.'),
            'category' => $schema->string()->required()->description('El tipo o nombre de la categoría del gasto (ej. Alimentación, Transporte, Entretenimiento).'),
            'description' => $schema->string()->description('Breve detalle o descripción del gasto.'),
        ];
    }
}
