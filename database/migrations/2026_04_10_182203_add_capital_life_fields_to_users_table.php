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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('parent')->after('password'); // 'parent' | 'child'
            $table->foreignId('parent_id')->nullable()->constrained('users')->nullOnDelete()->after('role');
            $table->decimal('balance', 10, 2)->default(0.00)->after('parent_id');
            $table->string('phone', 20)->nullable()->after('balance');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['role', 'parent_id', 'balance', 'phone']);
        });
    }
};
