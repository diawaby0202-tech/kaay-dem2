<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_profiles', function (Blueprint $table) {
            $table->id();

            // Relation 1-1 : un user a AU PLUS un profil conducteur.
            // unique() garantit qu'on ne peut pas créer 2 profils pour le même user.
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete()
                ->unique();

            $table->string('numero_permis');
            $table->string('vehicule_marque');
            $table->string('vehicule_modele');
            $table->string('immatriculation');

            // Statut stocké en string, casté en enum côté modèle (voir DriverProfile.php)
            $table->string('statut_validation')->default('en_attente');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_profiles');
    }
};
