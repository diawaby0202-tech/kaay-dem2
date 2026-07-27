<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();

            // Une évaluation par réservation terminée (EF-07) → relation 1-1,
            // donc unique() sur reservation_id
            $table->foreignId('reservation_id')
                ->constrained()
                ->cascadeOnDelete()
                ->unique();

            $table->unsignedTinyInteger('note'); // 1 à 5, contrôlé au niveau validation
            $table->text('commentaire')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
