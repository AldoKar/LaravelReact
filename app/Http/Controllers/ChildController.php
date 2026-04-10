<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChildRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChildController extends Controller
{
    /**
     * Display a listing of the parent's children accounts.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Ensure only parents can access this
        if (!$user->isParent()) {
            abort(403, 'No autorizado');
        }

        $children = $user->children()
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('children/index', [
            'children' => $children,
        ]);
    }

    /**
     * Display the dashboard for a specific child.
     */
    public function show(Request $request, User $child): Response
    {
        $user = $request->user();

        // Ensure only parents can access this
        if (!$user->isParent()) {
            abort(403, 'No autorizado');
        }

        // Ensure the child belongs to this parent
        if ($child->parent_id !== $user->id) {
            abort(403, 'No autorizado');
        }

        // Ensure the user being viewed is actually a child
        if (!$child->isChild()) {
            abort(403, 'No autorizado');
        }

        return Inertia::render('children/show', [
            'targetUser' => [
                'id' => $child->id,
                'name' => $child->name,
                'balance' => (float) $child->balance,
                'role' => $child->role,
            ],
        ]);
    }

    /**
     * Store a newly created child account in storage.
     */
    public function store(ChildRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Authorization is handled by ChildRequest::authorize()
        // Validations are handled by ChildRequest::rules() and withValidator()

        $validated = $request->validated();

        // Create the child account
        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'child',
            'parent_id' => $user->id,
            'balance' => 0.00,
        ]);

        return back()->with('success', 'Cuenta hijo creada exitosamente');
    }

    /**
     * Remove the specified child account from storage.
     */
    public function destroy(Request $request, User $child): RedirectResponse
    {
        $user = $request->user();

        // Ensure only parents can delete children
        if (!$user->isParent()) {
            abort(403, 'No autorizado');
        }

        // Ensure the child belongs to this parent
        if ($child->parent_id !== $user->id) {
            abort(403, 'No autorizado');
        }

        // Ensure the user being deleted is actually a child
        if (!$child->isChild()) {
            abort(403, 'No autorizado');
        }

        // Unlink the child (set parent_id to null) instead of deleting
        // This preserves the expense history as per Requirement 5.4
        $child->update([
            'parent_id' => null,
        ]);

        return back()->with('success', 'Cuenta hijo desvinculada exitosamente');
    }
}
