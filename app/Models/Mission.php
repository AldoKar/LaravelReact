<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mission extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'child_id',
        'title',
        'description',
        'reward',
        'status',
        'reject_reason',
    ];

    protected $casts = [
        'reward' => 'decimal:2',
    ];

    /**
     * Get the parent who created this mission.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    /**
     * Get the child assigned to this mission.
     */
    public function child(): BelongsTo
    {
        return $this->belongsTo(User::class, 'child_id');
    }
}
