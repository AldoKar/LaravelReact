<?php

namespace App\Ai\Agents;

use App\Models\User;
use App\Ai\Tools\RegisterExpenseTool;
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

    public function model(): string
    {
        return 'gemini-1.5-flash';
    }


    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return "Eres el asistente financiero de Capital Family. Estás hablando con {$this->user->name}. "
             . "Su saldo actual en su cuenta principal es de \${$this->user->balance}. "
             . "Actúa como un analista amable y profesional. Si el usuario te indica un gasto, clasifícalo y utiliza tu herramienta "
             . "para insertarlo en la base de datos automáticamente. Luego, respóndele confirmando el gasto y su saldo restante.";
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
        ];
    }
}
