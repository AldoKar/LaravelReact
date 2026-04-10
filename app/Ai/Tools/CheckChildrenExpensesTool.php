<?php

namespace App\Ai\Tools;

use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class CheckChildrenExpensesTool implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): Stringable|string
    {
        return 'Verifica cuánto dinero tienen los hijos (children) del usuario actual en sus balances y cuánto dinero han gastado recientemente.';
    }

    public function handle(Request $request): Stringable|string
    {
        $children = $this->user->children;
        
        if ($children->isEmpty()) {
            return 'No tienes hijos registrados en tu cuenta vinculada de Capital Family.';
        }

        $report = "Aquí está el estado financiero actual de tus hijos:\n";
        
        foreach ($children as $child) {
            $recentExpenses = $child->expenses()->whereMonth('date', now()->month)->sum('amount');
            $report .= "- {$child->name}: Saldo actual \${$child->balance} MXN. Gastos acumulados este mes: \${$recentExpenses} MXN.\n";
        }

        return $report;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'filtro' => $schema->string()->description('Palabra opcional para filtrar los resultados, por lo general dejar en blanco o enviar "todos".'),
        ];
    }
}
