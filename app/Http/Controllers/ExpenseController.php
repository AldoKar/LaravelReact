<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRequest;
use App\Models\CategoryRestriction;
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
                $currentDay = strtolower($now->englishDayOfWeek); // e.g., "monday", "tuesday"
                $currentTime = $now->format('H:i');
                
                $allowedDays = $scheduleRestriction->days;
                $startTime = $scheduleRestriction->start_time->format('H:i');
                $endTime = $scheduleRestriction->end_time->format('H:i');
                
                // Check if current day is in the allowed days
                $isDayAllowed = in_array($currentDay, $allowedDays);
                
                // Check if current time is within the allowed interval
                $isTimeAllowed = $currentTime >= $startTime && $currentTime <= $endTime;
                
                if (!$isDayAllowed || !$isTimeAllowed) {
                    $debugInfo = sprintf(
                        'Día actual: %s (%s), Hora actual: %s, Días permitidos: %s, Horario: %s - %s',
                        $currentDay,
                        $isDayAllowed ? 'permitido' : 'NO permitido',
                        $currentTime,
                        implode(', ', $allowedDays),
                        $startTime,
                        $endTime
                    );
                    
                    return back()->withErrors([
                        'schedule' => 'No puedes registrar gastos en este horario. ' . $debugInfo
                    ]);
                }
            }
            
            // Check category restriction (Requirement 8)
            $categoryRestriction = CategoryRestriction::where('child_id', $user->id)
                ->where('category_id', $validated['category_id'])
                ->first();
            
            if ($categoryRestriction) {
                // Check if category is blocked
                if ($categoryRestriction->type === 'blocked') {
                    return back()->withErrors([
                        'category_id' => 'Tu padre ha bloqueado esta categoría'
                    ]);
                }
                
                // Check if monthly limit is reached
                if ($categoryRestriction->type === 'limited') {
                    $startOfMonth = now()->startOfMonth();
                    $endOfMonth = now()->endOfMonth();
                    
                    $totalSpentThisMonth = Expense::where('user_id', $user->id)
                        ->where('category_id', $validated['category_id'])
                        ->whereBetween('date', [$startOfMonth, $endOfMonth])
                        ->sum('amount');
                    
                    $newTotal = $totalSpentThisMonth + $validated['amount'];
                    
                    if ($newTotal > $categoryRestriction->monthly_limit) {
                        return back()->withErrors([
                            'category_id' => 'Has alcanzado el límite mensual para esta categoría'
                        ]);
                    }
                }
            }
            
            // Check if user has sufficient balance
            if ($user->balance < $validated['amount']) {
                return back()->withErrors([
                    'amount' => 'Saldo insuficiente para registrar este gasto'
                ]);
            }
        }

        try {
            DB::transaction(function () use ($user, $validated): void {
                $lockedUser = User::query()
                    ->whereKey($user->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                // Create the expense
                $lockedUser->expenses()->create($validated);
                
                // Only reduce balance for child users
                if ($lockedUser->isChild()) {
                    $lockedUser->decrement('balance', $validated['amount']);
                }
            });

            return back()->with('success', 'Gasto registrado exitosamente');
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'Error al registrar el gasto: ' . $e->getMessage()
            ]);
        }
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
            
            // Only adjust balance for child users
            if ($lockedUser->isChild()) {
                $lockedUser->increment('balance', $originalAmount - (float) $validated['amount']);
            }
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

            // Only restore balance for child users
            if ($lockedUser->isChild()) {
                $lockedUser->increment('balance', $lockedExpense->amount);
            }
            
            $lockedExpense->delete();
        });

        return back()->with('success', 'Gasto eliminado exitosamente');
    }
}
