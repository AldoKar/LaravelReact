<?php

namespace App\Http\Controllers;

use App\Models\CategoryRestriction;
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
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->whereBetween('expenses.date', [$currentMonth->toDateString(), $currentMonthEnd->toDateString()])
            ->selectRaw('categories.name as category, SUM(expenses.amount) as total')
            ->groupBy('categories.id', 'categories.name')
            ->get()
            ->map(fn($item) => [
                'category' => $item->category,
                'total' => (float) $item->total,
            ]);

        // Last 5 expenses
        $recentExpenses = $targetUser->expenses()
            ->with('category')
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get children data if user is a parent
        $children = [];
        if ($user->isParent()) {
            $children = $user->children()
                ->select('id', 'name', 'balance')
                ->get()
                ->map(fn($child) => [
                    'id' => $child->id,
                    'nombre' => $child->name,
                    'monto' => (float) $child->balance,
                    'avatar' => strtoupper(substr($child->name, 0, 1)),
                ]);
        }

        // Get category restrictions if target user is a child
        $categoryRestrictions = [];
        if ($targetUser->isChild()) {
            $categoryRestrictions = CategoryRestriction::where('child_id', $targetUser->id)
                ->with('category')
                ->get()
                ->map(fn($restriction) => [
                    'id' => $restriction->id,
                    'category' => [
                        'id' => $restriction->category->id,
                        'name' => $restriction->category->name,
                    ],
                    'type' => $restriction->type,
                    'monthly_limit' => $restriction->monthly_limit ? (float) $restriction->monthly_limit : null,
                ]);
        }

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
            'currentUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'balance' => (float) $user->balance,
            ],
            'children' => $children,
            'categoryRestrictions' => $categoryRestrictions,
        ]);
    }
}
