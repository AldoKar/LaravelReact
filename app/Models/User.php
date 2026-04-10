<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Carbon\CarbonInterface;
use Database\Factories\UserFactory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['name', 'email', 'password', 'role', 'parent_id', 'balance', 'phone'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'balance' => 'decimal:2',
        ];
    }

    // Relaciones
    public function parent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function children(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'parent_id');
    }

    public function expenses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function categories(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Category::class);
    }

    /**
     * Return summed expenses for the last N periods.
     *
     * @return Collection<int, array{key: string, label: string, total: float}>
     */
    public function summedExpenses(string $period = 'day', int $periods = 10): Collection
    {
        $period = strtolower($period);
        $periods = max(1, $periods);

        if (! in_array($period, ['day', 'week', 'month'], true)) {
            throw new \InvalidArgumentException('Period must be day, week, or month.');
        }

        $today = now();

        $bucketStarts = collect(range($periods - 1, 0))->map(
            fn (int $offset) => match ($period) {
                'day' => $today->copy()->subDays($offset)->startOfDay(),
                'week' => $today->copy()->subWeeks($offset)->startOfWeek(),
                'month' => $today->copy()->subMonths($offset)->startOfMonth(),
            }
        );

        $rangeStart = $bucketStarts->first()->copy()->startOfDay();
        $rangeEnd = match ($period) {
            'day' => $today->copy()->endOfDay(),
            'week' => $today->copy()->endOfWeek(),
            'month' => $today->copy()->endOfMonth(),
        };

        $totalsByKey = $this->expenses()
            ->whereBetween('date', [$rangeStart->toDateString(), $rangeEnd->toDateString()])
            ->get(['amount', 'date'])
            ->groupBy(fn (Expense $expense) => $this->periodKey(Carbon::parse($expense->date), $period))
            ->map(fn (Collection $items) => round($items->sum(fn (Expense $expense) => (float) $expense->amount), 2));

        return $bucketStarts->map(function (CarbonInterface $start) use ($period, $totalsByKey): array {
            $key = $this->periodKey($start, $period);

            return [
                'key' => $key,
                'label' => $this->periodLabel($start, $period),
                'total' => (float) ($totalsByKey[$key] ?? 0),
            ];
        })->values();
    }

    /**
     * Shortcut for summed expenses by day.
     *
     * @return Collection<int, array{key: string, label: string, total: float}>
     */
    public function summedExpensesByDays(int $days = 10): Collection
    {
        return $this->summedExpenses('day', $days);
    }

    /**
     * Shortcut for summed expenses by week.
     *
     * @return Collection<int, array{key: string, label: string, total: float}>
     */
    public function summedExpensesByWeeks(int $weeks = 10): Collection
    {
        return $this->summedExpenses('week', $weeks);
    }

    /**
     * Shortcut for summed expenses by month.
     *
     * @return Collection<int, array{key: string, label: string, total: float}>
     */
    public function summedExpensesByMonths(int $months = 10): Collection
    {
        return $this->summedExpenses('month', $months);
    }

    private function periodKey(CarbonInterface $date, string $period): string
    {
        return match ($period) {
            'day' => $date->copy()->startOfDay()->format('Y-m-d'),
            'week' => $date->copy()->startOfWeek()->format('Y-m-d'),
            'month' => $date->copy()->startOfMonth()->format('Y-m'),
        };
    }

    private function periodLabel(CarbonInterface $start, string $period): string
    {
        return match ($period) {
            'day' => $start->format('M d'),
            'week' => 'Week of '.$start->format('M d'),
            'month' => $start->format('M Y'),
        };
    }

    // Scopes
    public function scopeIsParent($query)
    {
        return $query->where('role', 'parent');
    }

    public function scopeIsChild($query)
    {
        return $query->where('role', 'child');
    }

    // Helpers
    public function isParent(): bool
    {
        return $this->role === 'parent';
    }

    public function isChild(): bool
    {
        return $this->role === 'child';
    }

    public function ensureDefaultCategories(): void
    {
        if ($this->categories()->exists()) {
            return;
        }

        $categoryNames = [
            'Groceries',
            'Dining Out',
            'Coffee & Snacks',
            'Fuel & Vehicle Care',
            'Public Transit & Rideshare',
            'Rent or Mortgage',
            'Utilities',
            'Digital Services',
            'Home Maintenance',
            'Medical & Pharmacy',
            'Fitness & Wellness',
            'Personal Care',
            'Subscriptions & Streaming',
            'Social & Events',
            'Clothing & Accessories',
            'Hobbies',
            'Education & Training',
            'Books & Media',
            'Debt & Interest',
            'Gifts & Donations',
        ];

        foreach ($categoryNames as $name) {
            $this->categories()->create([
                'name' => $name,
                'icon' => null,
            ]);
        }
    }
}
