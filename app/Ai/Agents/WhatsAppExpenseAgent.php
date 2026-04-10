<?php

namespace App\Ai\Agents;

use App\Models\User;
use App\Ai\Tools\RegisterExpenseTool;
use App\Ai\Tools\GetExpenseHistoryTool;
use App\Ai\Tools\CheckChildrenExpensesTool;
use App\Ai\Tools\RegisterChildExpenseTool;
use App\Ai\Tools\GetChildExpenseHistoryTool;
use App\Ai\Tools\CreateMissionTool;
use App\Ai\Tools\CompleteMissionTool;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class WhatsAppExpenseAgent implements Agent, Conversational, HasTools
{
    use Promptable;

    public function __construct(public User $user, public array $messages = []) {}

    public function provider(): string
    {
        return 'gemini';
    }


    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return "Eres el asistente financiero de Capital Life. Estás hablando con {$this->user->name}. "
             . "Su saldo actual en su cuenta principal es de \${$this->user->balance}. "
             . "Actúa como un analista amable y profesional. "
             . "1) Si el usuario indica un gasto propio, usa RegisterExpenseTool. "
             . "2) Si el usuario te pide conocer en qué ha gastado ÉL MISMO, o su historial de gastos, usa GetExpenseHistoryTool. "
             . "3) Si pide ver los saldos actuales de sus hijos, usa CheckChildrenExpensesTool. "
             . "4) Si te pide registrar un gasto para alguno de sus hijos, usa RegisterChildExpenseTool. "
             . "5) Si te pregunta en qué ha gastado su hijo o el desglose, usa GetChildExpenseHistoryTool. "
             . "6) Si quiere asignarle una TAREA o MISIÓN a su hijo con una recompensa económica, usa CreateMissionTool. "
             . "7) Si dice que su hijo ya hizo la tarea o te pide pagarla/completarla, usa CompleteMissionTool. "
             . "Clasifica automáticamente el gasto en una categoría. Confírmale el resultado a su petición. Tu texto siempre será visualizado de excelente manera en un chat de WhatsApp con formato markdown.";
    }

    /**
     * Get the list of messages comprising the conversation so far.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
        return $this->messages;
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [
            new RegisterExpenseTool($this->user),
            new GetExpenseHistoryTool($this->user),
            new CheckChildrenExpensesTool($this->user),
            new RegisterChildExpenseTool($this->user),
            new GetChildExpenseHistoryTool($this->user),
            new CreateMissionTool($this->user),
            new CompleteMissionTool($this->user),
        ];
    }
}
