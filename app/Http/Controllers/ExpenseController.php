<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRequest;
use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        ]);

        $period = $validated['period'] ?? 'day';
        $periods = $validated['periods'] ?? 10;

        return response()->json([
            'period' => $period,
            'periods' => $periods,
            'data' => $request->user()->summedExpenses($period, $periods),
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
            // TODO: Implement schedule restriction validation (Requirement 7)
            // TODO: Implement category restriction validation (Requirement 8)
        }

        // Create the expense
        $user->expenses()->create($validated);

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

        $expense->update($validated);

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

        $expense->delete();

        return back()->with('success', 'Gasto eliminado exitosamente');
    }
}
