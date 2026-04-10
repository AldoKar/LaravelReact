<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Mission;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MissionController extends Controller
{
    /**
     * Display a listing of missions.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->isParent()) {
            // Parent view: all missions they created
            $missions = Mission::where('parent_id', $user->id)
                ->with('child:id,name')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($mission) => [
                    'id' => $mission->id,
                    'title' => $mission->title,
                    'description' => $mission->description,
                    'reward' => (float) $mission->reward,
                    'status' => $mission->status,
                    'reject_reason' => $mission->reject_reason,
                    'child' => [
                        'id' => $mission->child->id,
                        'name' => $mission->child->name,
                    ],
                    'created_at' => $mission->created_at->toISOString(),
                ]);

            $children = $user->children()->get(['id', 'name']);

            return Inertia::render('missions/index', [
                'missions' => $missions,
                'children' => $children,
                'userRole' => 'parent',
            ]);
        } else {
            // Child view: missions assigned to them
            $missions = Mission::where('child_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($mission) => [
                    'id' => $mission->id,
                    'title' => $mission->title,
                    'description' => $mission->description,
                    'reward' => (float) $mission->reward,
                    'status' => $mission->status,
                    'reject_reason' => $mission->reject_reason,
                    'created_at' => $mission->created_at->toISOString(),
                ]);

            return Inertia::render('missions/index', [
                'missions' => $missions,
                'userRole' => 'child',
            ]);
        }
    }

    /**
     * Store a newly created mission (parent only).
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isParent()) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'child_id' => 'required|exists:users,id',
            'title' => 'required|string|max:100',
            'description' => 'nullable|string',
            'reward' => 'required|numeric|min:0.01',
        ]);

        // Verify the child belongs to this parent
        $child = User::find($validated['child_id']);
        if ($child->parent_id !== $user->id) {
            abort(403, 'No autorizado');
        }

        // Warning if reward exceeds parent balance (Req 10.4)
        if ($validated['reward'] > $user->balance) {
            return back()->withErrors([
                'reward' => 'La recompensa supera tu saldo disponible'
            ])->withInput();
        }

        Mission::create([
            'parent_id' => $user->id,
            'child_id' => $validated['child_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'reward' => $validated['reward'],
            'status' => 'activa',
        ]);

        return back()->with('success', 'Misión creada exitosamente');
    }

    /**
     * Mark a mission as completed (child only).
     */
    public function complete(Request $request, Mission $mission): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isChild()) {
            abort(403, 'No autorizado');
        }

        // Verify the mission is assigned to this child
        if ($mission->child_id !== $user->id) {
            abort(403, 'No autorizado');
        }

        // Only active missions can be marked as completed
        if ($mission->status !== 'activa') {
            return back()->withErrors([
                'message' => 'Esta misión no puede ser marcada como completada'
            ]);
        }

        $mission->update([
            'status' => 'en_revision',
        ]);

        return back()->with('success', 'Misión enviada para revisión');
    }

    /**
     * Approve a mission completion (parent only).
     */
    public function approve(Request $request, Mission $mission): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isParent()) {
            abort(403, 'No autorizado');
        }

        // Verify the mission belongs to this parent
        if ($mission->parent_id !== $user->id) {
            abort(403, 'No autorizado');
        }

        // Only missions in review can be approved
        if ($mission->status !== 'en_revision') {
            return back()->withErrors([
                'message' => 'Esta misión no está en revisión'
            ]);
        }

        DB::transaction(function () use ($mission, $user) {
            $lockedMission = Mission::query()
                ->whereKey($mission->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedParent = User::query()
                ->whereKey($user->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedChild = User::query()
                ->whereKey($lockedMission->child_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ((float) $lockedParent->balance < (float) $lockedMission->reward) {
                throw ValidationException::withMessages([
                    'message' => 'No tienes saldo suficiente para aprobar esta misión.',
                ]);
            }

            $familyCategory = Category::firstOrCreate(
                [
                    'user_id' => $lockedParent->id,
                    'name' => 'Family',
                ],
                [
                    'icon' => null,
                ],
            );

            $lockedMission->update([
                'status' => 'completada',
            ]);

            $lockedChild->increment('balance', $lockedMission->reward);
            $lockedParent->decrement('balance', $lockedMission->reward);

            $lockedParent->expenses()->create([
                'category_id' => $familyCategory->id,
                'amount' => $lockedMission->reward,
                'description' => 'Recompensa por misión: '.$lockedMission->title.' ('.$lockedChild->name.')',
                'date' => now()->toDateString(),
            ]);
        });

        return back()->with('success', 'Misión aprobada, recompensa acreditada y gasto familiar registrado');
    }

    /**
     * Reject a mission completion (parent only).
     */
    public function reject(Request $request, Mission $mission): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isParent()) {
            abort(403, 'No autorizado');
        }

        // Verify the mission belongs to this parent
        if ($mission->parent_id !== $user->id) {
            abort(403, 'No autorizado');
        }

        // Only missions in review can be rejected
        if ($mission->status !== 'en_revision') {
            return back()->withErrors([
                'message' => 'Esta misión no está en revisión'
            ]);
        }

        $validated = $request->validate([
            'reject_reason' => 'nullable|string|max:255',
        ]);

        $mission->update([
            'status' => 'activa',
            'reject_reason' => $validated['reject_reason'] ?? null,
        ]);

        return back()->with('success', 'Misión rechazada');
    }
}
