<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('trip_id')
                ->constrained()
                ->cascadeOnDelete();

            // Le passager est un "user" — pas une table séparée, car un même
            // compte peut réserver (passager) ET publier des trajets (conducteur).
            $table->foreignId('passenger_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->unsignedTinyInteger('nombre_places');

            $table->string('statut')->default('en_attente');

            $table->timestamps();
            $table->softDeletes();

            // Un passager ne devrait pas avoir 2 réservations actives sur le
            // même trajet (règle métier appliquée aussi côté Service/Policy)
            $table->unique(['trip_id', 'passenger_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
