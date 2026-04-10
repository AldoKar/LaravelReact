<?php

use App\Http\Controllers\ExpenseController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('capital-family', 'capital-family')->name('capital-family');
    Route::inertia('travel', 'travel')->name('travel');

    // Expense routes
    Route::resource('expenses', ExpenseController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);
});

require __DIR__.'/settings.php';

// hola
