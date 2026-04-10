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

class GetExpenseHistoryTool implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): Stringable|string
    {
        return 'Consulta tu propio historial de gastos personales. Permite filtrar por un rango de tiempo: hoy, ayer, esta_semana, este_mes, o historico.';
    }

    public function handle(Request $request): Stringable|string
    {
        $timeframe = (string) ($request['timeframe'] ?? 'este_mes');

        $query = Expense::where('user_id', $this->user->id)->orderBy('date', 'desc');

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
            return "No se encontraron gastos personales registrados en el periodo '{$timeframe}'.";
        }

        $result = "📄 *Tu Historial Personal ({$timeframe})*:\n\n";
        $total = 0;
        foreach ($expenses as $expense) {
            $catName = $expense->category ? $expense->category->name : 'General';
            $result .= "• \${$expense->amount} en {$catName} ({$expense->date})\n";
            if (!empty($expense->description)) {
                $result .= "  _Nota: {$expense->description}_\n";
            }
            $total += $expense->amount;
        }

        $result .= "\n💰 *Tu gasto total del periodo:* \${$total}";

        return $result;
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'timeframe' => $schema->string()->description('El periodo de tiempo exacto sugerido. Valores: "hoy", "ayer", "esta_semana", "este_mes", "historico". Por defecto "este_mes".'),
        ];
    }
}
