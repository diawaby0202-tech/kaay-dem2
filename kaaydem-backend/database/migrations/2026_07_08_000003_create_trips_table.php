<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();

            // Le conducteur est un "user" (pas un "driver_profile") car c'est
            // bien l'utilisateur qui publie le trajet ; le driver_profile
            // ne sert qu'à stocker permis/véhicule.
            $table->foreignId('driver_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('ville_depart');
            $table->string('ville_arrivee');

            // Points d'arrêt intermédiaires : structure libre, donc JSON
            // Exemple attendu : [{"ville": "Rufisque", "ordre": 1}, ...]
            $table->json('points_arret')->nullable();

            $table->dateTime('date_heure_depart');

            $table->unsignedTinyInteger('places_totales');
            // Dénormalisation volontaire : évite de recompter les réservations
            // à chaque recherche. Mise à jour via ReservationService (EF-05).
            $table->unsignedTinyInteger('places_disponibles');

            $table->decimal('prix_par_place', 8, 2);

            $table->string('statut')->default('publie');

            $table->timestamps();

            // EF-03 : modification/annulation impossibles après réservation confirmée
            // → on garde une trace au lieu de supprimer réellement la ligne
            $table->softDeletes();

            // Index pour accélérer la recherche publique (EF-04)
            $table->index(['ville_depart', 'ville_arrivee', 'date_heure_depart']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
