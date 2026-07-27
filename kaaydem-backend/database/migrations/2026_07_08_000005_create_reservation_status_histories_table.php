<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table dédiée pour respecter EF-06 : "chaque transition est
        // historisée (date, acteur)". Un simple champ "statut" sur
        // reservations ne suffit pas à garder cet historique.
        Schema::create('reservation_status_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('reservation_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('statut'); // valeur de ReservationStatus

            // Qui a déclenché la transition (conducteur, passager, ou système)
            $table->foreignId('acteur_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // On garde seulement created_at (pas de updated_at : une ligne
            // d'historique n'est jamais modifiée, seulement créée)
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_status_histories');
    }
};
