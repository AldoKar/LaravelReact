<?php

namespace App\Ai\Tools;

use App\Models\User;
use App\Models\Mission;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class CompleteMissionTool implements Tool
{
    public function __construct(protected User $user) {}

    public function description(): Stringable|string
    {
        return 'Permite al padre marcar una misión o tarea de su hijo como COMPLETADA y pagarle la recompensa automáticamente.';
    }

    public function handle(Request $request): Stringable|string
    {
        $childName = (string) ($request['child_name'] ?? '');
        $missionKeyword = (string) ($request['mission_keyword'] ?? '');

        if (empty($childName)) {
             return "Debes proporcionar el nombre del hijo que acaba de completar la tarea.";
        }

        $child = $this->user->children()->where('name', 'ilike', '%' . $childName . '%')->first();

        if (!$child) {
            return "No tienes ningún hijo registrado con el nombre '{$childName}'.";
        }

        $query = Mission::where('child_id', $child->id)
            ->whereIn('status', ['activa', 'en_revision']);

        if (!empty($missionKeyword)) {
            $query->where('title', 'ilike', '%' . $missionKeyword . '%');
        }

        $mission = $query->first();

        if (!$mission) {
            if (!empty($missionKeyword)) {
                return "No se ha encontrado ninguna misión activa o en revisión con el título '{$missionKeyword}' para {$child->name}.";
            }
            return "El hijo {$child->name} no tiene ninguna misión pendiente en este momento.";
        }

        $mission->update(['status' => 'completada']);
        $child->increment('balance', $mission->reward);

        return "🎉 ¡Misión cumplida! He marcado la tarea '{$mission->title}' como completada para {$child->name}. Se le han depositado \${$mission->reward} a su cuenta automáticamente. Su nuevo saldo es \${$child->balance}.";
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'child_name' => $schema->string()->required()->description('El nombre del hijo que realizó la tarea.'),
            'mission_keyword' => $schema->string()->description('Palabra clave de la misión o tarea si el usuario la mencionó (ej. "platos", "cuarto"). Si no mencionó una en específica, déjalo vacío.'),
        ];
    }
}
