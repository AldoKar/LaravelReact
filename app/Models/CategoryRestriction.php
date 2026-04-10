<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryRestriction extends Model
{
    protected $fillable = [
        'child_id',
        'category_id',
        'type',
        'monthly_limit',
    ];

    protected $casts = [
        'monthly_limit' => 'decimal:2',
    ];

    public function child(): BelongsTo
    {
        return $this->belongsTo(User::class, 'child_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
