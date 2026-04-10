<?php

use App\Models\Category;
use App\Models\ScheduleRestriction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('child user can create expense when no schedule restriction exists', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $child = User::factory()->create([
        'role' => 'child',
        'parent_id' => $parent->id,
    ]);
    $category = Category::factory()->create(['user_id' => $child->id]);

    $response = $this->actingAs($child)->post(route('expenses.store'), [
        'amount' => 50.00,
        'category_id' => $category->id,
        'description' => 'Test expense',
        'date' => now()->toDateString(),
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('expenses', [
        'user_id' => $child->id,
        'amount' => 50.00,
    ]);
});

test('child user can create expense when within allowed schedule', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $child = User::factory()->create([
        'role' => 'child',
        'parent_id' => $parent->id,
    ]);
    $category = Category::factory()->create(['user_id' => $child->id]);

    $now = now();
    $currentDay = strtolower($now->format('l'));
    
    // Create restriction that allows current time
    ScheduleRestriction::create([
        'child_id' => $child->id,
        'days' => [$currentDay],
        'start_time' => $now->copy()->subHour()->format('H:i'),
        'end_time' => $now->copy()->addHour()->format('H:i'),
    ]);

    $response = $this->actingAs($child)->post(route('expenses.store'), [
        'amount' => 50.00,
        'category_id' => $category->id,
        'description' => 'Test expense',
        'date' => now()->toDateString(),
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('expenses', [
        'user_id' => $child->id,
        'amount' => 50.00,
    ]);
});

test('child user cannot create expense when outside allowed schedule time', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $child = User::factory()->create([
        'role' => 'child',
        'parent_id' => $parent->id,
    ]);
    $category = Category::factory()->create(['user_id' => $child->id]);

    $now = now();
    $currentDay = strtolower($now->format('l'));
    
    // Create restriction that blocks current time (ended 1 hour ago)
    ScheduleRestriction::create([
        'child_id' => $child->id,
        'days' => [$currentDay],
        'start_time' => $now->copy()->subHours(3)->format('H:i'),
        'end_time' => $now->copy()->subHour()->format('H:i'),
    ]);

    $response = $this->actingAs($child)->post(route('expenses.store'), [
        'amount' => 50.00,
        'category_id' => $category->id,
        'description' => 'Test expense',
        'date' => now()->toDateString(),
    ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('schedule');
    $this->assertDatabaseMissing('expenses', [
        'user_id' => $child->id,
        'amount' => 50.00,
    ]);
});

test('child user can create expense when current day is not in restriction', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $child = User::factory()->create([
        'role' => 'child',
        'parent_id' => $parent->id,
    ]);
    $category = Category::factory()->create(['user_id' => $child->id]);

    $now = now();
    $currentDay = strtolower($now->format('l'));
    
    // Get a different day
    $differentDay = $currentDay === 'monday' ? 'tuesday' : 'monday';
    
    // Create restriction for a different day
    ScheduleRestriction::create([
        'child_id' => $child->id,
        'days' => [$differentDay],
        'start_time' => '00:00',
        'end_time' => '01:00',
    ]);

    $response = $this->actingAs($child)->post(route('expenses.store'), [
        'amount' => 50.00,
        'category_id' => $category->id,
        'description' => 'Test expense',
        'date' => now()->toDateString(),
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('expenses', [
        'user_id' => $child->id,
        'amount' => 50.00,
    ]);
});

test('parent user can create expense regardless of schedule restrictions', function () {
    $parent = User::factory()->create(['role' => 'parent']);
    $category = Category::factory()->create(['user_id' => $parent->id]);

    $response = $this->actingAs($parent)->post(route('expenses.store'), [
        'amount' => 100.00,
        'category_id' => $category->id,
        'description' => 'Parent expense',
        'date' => now()->toDateString(),
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('expenses', [
        'user_id' => $parent->id,
        'amount' => 100.00,
    ]);
});
