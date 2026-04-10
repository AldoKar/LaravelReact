<?php

namespace App\Http\Controllers;

use App\Models\ScheduleRestriction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RestrictionController extends Controller
{
    /**
     * Display the restrictions management page for a child.
     */
    public function index(Request $request, User $child): Response
    {
        $user = $request->user();

        // Ensure only parents can view restrictions
        if (!$user->isParent()) {
            abort(403, 'No autorizado');
        }

        // Ensure the child belongs to this parent
        if ($child->parent_id !== $user->id) {
            abort(403, 'No autorizado');
        }

        // Ensure the user is actually a child
        if (!$child->isChild()) {
            abort(403, 'No autorizado');
        }

        // Load the schedule restriction if it exists
        $scheduleRestriction = ScheduleRestriction::where('child_id', $child->id)->first();

        return Inertia::render('restrictions/index', [
            'child' => [
                'id' => $child->id,
                'name' => $child->name,
                'email' => $child->email,
                'balance' => $child->balance,
            ],
            'scheduleRestriction' => $scheduleRestriction ? [
                'id' => $scheduleRestriction->id,
                'days' => $scheduleRestriction->days,
                'start_time' => $scheduleRestriction->start_time->format('H:i'),
                'end_time' => $scheduleRestriction->end_time->format('H:i'),
            ] : null,
        ]);
    }

    /**
     * Store a new schedule restriction for a child.
     */
    public function storeSchedule(Request $request, User $child): RedirectResponse
    {
        $user = $request->user();

        // Ensure only parents can create restrictions
        if (!$user->isParent()) {
            abort(403, 'No autorizado');
        }

        // Ensure the child belongs to this parent
        if ($child->parent_id !== $user->id) {
            abort(403, 'No autorizado');
        }

        // Ensure the user is actually a child
        if (!$child->isChild()) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'days' => ['required', 'array', 'min:1'],
            'days.*' => ['required', 'string', Rule::in(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        // Create or update the schedule restriction (one per child)
        ScheduleRestriction::updateOrCreate(
            ['child_id' => $child->id],
            [
                'days' => $validated['days'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
            ]
        );

        return back()->with('success', 'Restricción de horario configurada exitosamente');
    }

    /**
     * Update an existing schedule restriction for a child.
     */
    public function updateSchedule(Request $request, User $child): RedirectResponse
    {
        $user = $request->user();

        // Ensure only parents can update restrictions
        if (!$user->isParent()) {
            abort(403, 'No autorizado');
        }

        // Ensure the child belongs to this parent
        if ($child->parent_id !== $user->id) {
            abort(403, 'No autorizado');
        }

        // Ensure the user is actually a child
        if (!$child->isChild()) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'days' => ['required', 'array', 'min:1'],
            'days.*' => ['required', 'string', Rule::in(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        $restriction = ScheduleRestriction::where('child_id', $child->id)->firstOrFail();

        $restriction->update([
            'days' => $validated['days'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
        ]);

        return back()->with('success', 'Restricción de horario actualizada exitosamente');
    }
}
