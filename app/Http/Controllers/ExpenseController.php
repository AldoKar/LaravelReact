<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRequest;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    /**
     * Return summed expenses for the authenticated user by period.
     */
    public function summary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:day,week,month'],
            'periods' => ['nullable', 'integer', 'min:1', 'max:120'],
            'child_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $period = $validated['period'] ?? 'day';
        $periods = $validated['periods'] ?? 10;
        $childId = $validated['child_id'] ?? null;

        // Determine which user's expenses to summarize
        if ($childId) {
            // Ensure the authenticated user is a parent
            if (!$request->user()->isParent()) {
                abort(403, 'No autorizado');
            }

            // Find the child and ensure it belongs to the authenticated parent
            $child = \App\Models\User::find($childId);

            if (!$child || $child->parent_id !== $request->user()->id) {
                abort(404, 'Cuenta hijo no encontrada');
            }

            $targetUser = $child;
        } else {
            $targetUser = $request->user();
        }

        return response()->json([
            'period' => $period,
            'periods' => $periods,
            'data' => $targetUser->summedExpenses($period, $periods),
        ]);
    }

    /**
     * Display a listing of the user's expenses.
     */
    public function index(Request $request): Response
    {
        $expenses = $request->user()
            ->expenses()
            ->with('category')
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('expenses/index', [
            'expenses' => $expenses,
        ]);
    }

    /**
     * Store a newly created expense in storage.
     */
    public function store(ExpenseRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Get validated data
        $validated = $request->validated();

        // Check restrictions for child users
        if ($user->isChild()) {
            // Check schedule restriction (Requirement 7)
            $scheduleRestriction = \App\Models\ScheduleRestriction::where('child_id', $user->id)->first();
            
            if ($scheduleRestriction) {
                $now = now();
                $currentDay = strtolower($now->format('l')); // e.g., "monday"
                $currentTime = $now->format('H:i:s');
                
                $allowedDays = $scheduleRestriction->days;
                $startTime = $scheduleRestriction->start_time->format('H:i:s');
                $endTime = $scheduleRestriction->end_time->format('H:i:s');
                
                // Check if current day is NOT in the allowed days OR time is outside the allowed interval
                $isDayAllowed = in_array($currentDay, $allowedDays);
                $isTimeAllowed = $currentTime >= $startTime && $currentTime <= $endTime;
                
                if (!$isDayAllowed || !$isTimeAllowed) {
                    return back()->withErrors([
                        'schedule' => 'No puedes registrar gastos en este horario'
                    ]);
                }
            }
            
            // TODO: Implement category restriction validation (Requirement 8)
        }

        DB::transaction(function () use ($user, $validated): void {
            $lockedUser = User::query()
                ->whereKey($user->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Create the expense and reduce the available balance in the same transaction.
            $lockedUser->expenses()->create($validated);
            $lockedUser->decrement('balance', $validated['amount']);
        });

        return back()->with('success', 'Gasto registrado exitosamente');
    }

    /**
     * Update the specified expense in storage.
     */
    public function update(ExpenseRequest $request, Expense $expense): RedirectResponse
    {
        // Ensure user can only update their own expenses
        if ($expense->user_id !== $request->user()->id) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validated();

        DB::transaction(function () use ($request, $expense, $validated): void {
            $lockedExpense = Expense::query()
                ->whereKey($expense->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedUser = User::query()
                ->whereKey($request->user()->id)
                ->lockForUpdate()
                ->firstOrFail();

            $originalAmount = (float) $lockedExpense->amount;

            $lockedExpense->update($validated);
            $lockedUser->increment('balance', $originalAmount - (float) $validated['amount']);
        });

        return back()->with('success', 'Gasto actualizado exitosamente');
    }

    /**
     * Remove the specified expense from storage.
     */
    public function destroy(Request $request, Expense $expense): RedirectResponse
    {
        // Ensure user can only delete their own expenses
        if ($expense->user_id !== $request->user()->id) {
            abort(403, 'No autorizado');
        }

        DB::transaction(function () use ($request, $expense): void {
            $lockedExpense = Expense::query()
                ->whereKey($expense->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedUser = User::query()
                ->whereKey($request->user()->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedUser->increment('balance', $lockedExpense->amount);
            $lockedExpense->delete();
        });

        return back()->with('success', 'Gasto eliminado exitosamente');
    }
}
