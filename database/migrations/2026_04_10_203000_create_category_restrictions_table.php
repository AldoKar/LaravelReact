<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('category_restrictions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->enum('type', ['blocked', 'limited'])->default('blocked');
            $table->decimal('monthly_limit', 10, 2)->nullable();
            $table->timestamps();

            // Unique constraint: one restriction per child per category
            $table->unique(['child_id', 'category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_restrictions');
    }
};
