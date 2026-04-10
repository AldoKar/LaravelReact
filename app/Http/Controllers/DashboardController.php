<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard for the authenticated user or a specific child.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $childId = $request->query('child_id');

        // If child_id is provided, validate and load child data
        if ($childId) {
            // Ensure the authenticated user is a parent
            if (!$user->isParent()) {
                abort(403, 'No autorizado');
            }

            // Find the child and ensure it belongs to the authenticated parent
            $child = User::find($childId);

            if (!$child || $child->parent_id !== $user->id) {
                abort(404, 'Cuenta hijo no encontrada');
            }

            // Use child as the target user for dashboard data
            $targetUser = $child;
        } else {
            // Use authenticated user for dashboard data
            $targetUser = $user;
        }

        // Calculate dashboard data for the target user
        $currentMonth = now()->startOfMonth();
        $currentMonthEnd = now()->endOfMonth();

        // Total expenses for current month
        $totalThisMonth = $targetUser->expenses()
            ->whereBetween('date', [$currentMonth->toDateString(), $currentMonthEnd->toDateString()])
            ->sum('amount');

        // Distribution by category for current month
        $expensesByCategory = $targetUser->expenses()
            ->whereBetween('date', [$currentMonth->toDateString(), $currentMonthEnd->toDateString()])
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->get()
            ->map(fn($item) => [
                'category' => $item->category,
                'total' => (float) $item->total,
            ]);

        // Last 5 expenses
        $recentExpenses = $targetUser->expenses()
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalThisMonth' => (float) $totalThisMonth,
                'expensesByCategory' => $expensesByCategory,
                'recentExpenses' => $recentExpenses,
            ],
            'targetUser' => $childId ? [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'balance' => $targetUser->balance,
                'role' => $targetUser->role,
            ] : null,
        ]);
    }
}
