<?php

namespace App\Ai\Tools;

use App\Models\User;
use App\Models\Category;
use App\Models\Expense;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;
use Carbon\Carbon;

class GetChildExpenseHistoryTool implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): Stringable|string
    {
        return 'Consulta el historial de gastos pasados de un hijo en específico. Útil cuando el usuario pregunta en qué ha gastado su hijo, los últimos gastos, o resumen de gastos.';
    }

    public function handle(Request $request): Stringable|string
    {
        $childName = (string) ($request['child_name'] ?? '');
        $timeframe = (string) ($request['timeframe'] ?? 'este_mes');

        if (empty($childName)) {
            return "El nombre del hijo es obligatorio para consultar sus gastos.";
        }

        $child = $this->user->children()->where('name', 'ilike', '%' . $childName . '%')->first();

        if (!$child) {
            return "No tienes ningún hijo registrado con el nombre '{$childName}'.";
        }

        $query = Expense::where('user_id', $child->id)->orderBy('date', 'desc');

        switch ($timeframe) {
            case 'hoy':
                $query->whereDate('date', now()->toDateString());
                break;
            case 'ayer':
                $query->whereDate('date', now()->subDay()->toDateString());
                break;
            case 'esta_semana':
                $query->whereBetween('date', [now()->startOfWeek()->toDateString(), now()->endOfWeek()->toDateString()]);
                break;
            case 'este_mes':
                $query->whereMonth('date', now()->month)->whereYear('date', now()->year);
                break;
            case 'historico':
                $query->limit(20); // Limitamos a 20 para no saturar WhatsApp
                break;
            default:
                $query->whereMonth('date', now()->month)->whereYear('date', now()->year);
                break;
        }

        $expenses = $query->with('category')->get();

        if ($expenses->isEmpty()) {
            return "No se encontraron gastos para '{$child->name}' en el periodo '{$timeframe}'.";
        }

        $result = "📄 *Historial de {$child->name} ({$timeframe})*:\n\n";
        $total = 0;
        foreach ($expenses as $expense) {
            $catName = $expense->category ? $expense->category->name : 'General';
            $result .= "• \${$expense->amount} en {$catName} ({$expense->date})\n";
            if (!empty($expense->description)) {
                $result .= "  _Nota: {$expense->description}_\n";
            }
            $total += $expense->amount;
        }

        $result .= "\n💰 *Gasto total del periodo:* \${$total}";

        return $result;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'child_name' => $schema->string()->required()->description('El nombre del hijo a consultar (ej. "Diego", "Ana").'),
            'timeframe' => $schema->string()->description('El periodo de tiempo. Valores permitidos exactamente literales: "hoy", "ayer", "esta_semana", "este_mes", "historico". Por defecto es "este_mes".'),
        ];
    }
}
