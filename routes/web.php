<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\MissionController;
use App\Http\Controllers\RestrictionController;
use App\Http\Controllers\WhatsAppWebhookController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::inertia('capital-family', 'capital-family')->name('capital-family');
    Route::inertia('travel', 'travel')->name('travel');

    Route::get('expenses/summary', [ExpenseController::class, 'summary'])->name('expenses.summary');
    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');

    // Expense routes
    Route::resource('expenses', ExpenseController::class)->only([
        'index', 'store', 'update', 'destroy'
    ]);

    // Children routes
    Route::resource('children', ChildController::class)->only([
        'index', 'show', 'store', 'destroy'
    ]);

    // Restrictions routes
    Route::get('children/{child}/restrictions', [RestrictionController::class, 'index'])
        ->name('children.restrictions.index');
    Route::post('children/{child}/restrictions/schedule', [RestrictionController::class, 'storeSchedule'])
        ->name('children.restrictions.schedule.store');
    Route::put('children/{child}/restrictions/schedule', [RestrictionController::class, 'updateSchedule'])
        ->name('children.restrictions.schedule.update');
    Route::post('children/{child}/restrictions/category', [RestrictionController::class, 'storeCategory'])
        ->name('children.restrictions.category.store');
    Route::delete('children/{child}/restrictions/category/{restriction}', [RestrictionController::class, 'destroyCategory'])
        ->name('children.restrictions.category.destroy');

    // Mission routes
    Route::get('missions', [MissionController::class, 'index'])->name('missions.index');
    Route::post('missions', [MissionController::class, 'store'])->name('missions.store');
    Route::post('missions/{mission}/complete', [MissionController::class, 'complete'])->name('missions.complete');
    Route::post('missions/{mission}/approve', [MissionController::class, 'approve'])->name('missions.approve');
    Route::post('missions/{mission}/reject', [MissionController::class, 'reject'])->name('missions.reject');
});

require __DIR__.'/settings.php';

// Webhook Routes (Exempt from CSRF in bootstrap/app.php)
Route::get('webhook/whatsapp', [WhatsAppWebhookController::class, 'verify']);
Route::post('webhook/whatsapp', [WhatsAppWebhookController::class, 'handle']);

// hola
