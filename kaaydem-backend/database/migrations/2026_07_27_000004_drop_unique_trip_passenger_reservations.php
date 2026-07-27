<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * L'unique(trip_id, passenger_id) empêchait un passager de réserver à
     * nouveau un trajet dès qu'une précédente demande avait été refusée ou
     * annulée — la ligne restait en base (pas de suppression), donc la
     * contrainte bloquait indéfiniment. La vraie règle métier ("pas 2
     * réservations ACTIVES en même temps sur le même trajet") est
     * désormais vérifiée en PHP dans ReservationService, comme le
     * chevauchement d'horaires.
     */
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropUnique(['trip_id', 'passenger_id']);
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->unique(['trip_id', 'passenger_id']);
        });
    }
};
