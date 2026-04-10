<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    /**
     * Handle the GET request for WhatsApp Webhook Verification.
     */
    public function verify(Request $request)
    {
        $verifyToken = env('WHATSAPP_VERIFY_TOKEN', 'capital_family_2026');

        $mode = $request->query('hub_mode') ?? $request->query('hub.mode') ?? $request->input('hub_mode');
        $token = $request->query('hub_verify_token') ?? $request->query('hub.verify_token') ?? $request->input('hub_verify_token');
        $challenge = $request->query('hub_challenge') ?? $request->query('hub.challenge') ?? $request->input('hub_challenge');

        if ($mode && $token) {
            if ($mode === 'subscribe' && $token === $verifyToken) {
                Log::info('WhatsApp Webhook Verified Successfully!');
                return response($challenge, 200);
            }
            return response('Forbidden', 403);
        }

        return response('Bad Request', 400);
    }

    /**
     * Handle the POST request containing incoming WhatsApp messages or status updates.
     */
    public function handle(Request $request)
    {
        $body = $request->all();

        // Check if this is an event from a WhatsApp API subscription
        if (isset($body['object']) && $body['object'] === 'whatsapp_business_account') {

            foreach ($body['entry'] as $entry) {
                foreach ($entry['changes'] as $change) {
                    $value = $change['value'];
                    
                    // If there are messages
                    if (isset($value['messages']) && !empty($value['messages'])) {
                        $message = $value['messages'][0];
                        $from = $message['from']; // Senders phone number
                        $text = $message['text']['body'] ?? ''; // Message body if valid text

                        Log::info("WhatsApp Message received from {$from}: {$text}");

                        // TODO: Triggers for Capital Family
                        // e.g., if $text == "saldo", check DB and reply using WhatsApp API.
                    }
                }
            }
            return response('EVENT_RECEIVED', 200);
        }

        return response('', 404);
    }
}
