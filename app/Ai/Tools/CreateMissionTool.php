<?php

namespace App\Ai\Tools;

use App\Models\User;
use App\Models\Mission;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class CreateMissionTool implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): Stringable|string
    {
        return 'Crea una nueva misión (tarea) para un hijo con una recompensa económica. Útil cuando el usuario quiere pedirle a su hijo que haga algo a cambio de dinero.';
    }

    public function handle(Request $request): Stringable|string
    {
        $childName = (string) ($request['child_name'] ?? '');
        $title = (string) ($request['title'] ?? '');
        $description = (string) ($request['description'] ?? '');
        $reward = (float) ($request['reward'] ?? 0);

        if (empty($childName) || empty($title) || $reward <= 0) {
             return "Error: Debes proporcionar el nombre del hijo, el título de la tarea y sugerir una recompensa económica mayor a 0.";
        }

        $child = $this->user->children()->where('name', 'ilike', '%' . $childName . '%')->first();

        if (!$child) {
            return "No tienes ningún hijo registrado con el nombre '{$childName}'.";
        }

        $mission = Mission::create([
            'parent_id' => $this->user->id,
            'child_id' => $child->id,
            'title' => $title,
            'description' => $description,
            'reward' => $reward,
            'status' => 'activa',
        ]);

        return "🏆 Excelente. La misión '{$title}' ha sido creada para {$child->name} con una recompensa de \${$reward}. El estado inicial es 'activa'. Dile al padre que cuando el hijo termine, puede avisarte para marcarla completada.";
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'child_name' => $schema->string()->required()->description('El nombre del hijo al que se le asignará la misión.'),
            'title' => $schema->string()->required()->description('El título corto de la misión o tarea (ej. "Lavar los platos", "Acomodar su cuarto").'),
            'description' => $schema->string()->description('Instrucciones o descripción detallada de la misión.'),
            'reward' => $schema->number()->required()->description('Monto económico a pagar cuando se complete la misión (ej. 50).'),
        ];
    }
}
