<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Champs métier demandés par le cahier des charges (EF-01)
            $table->string('telephone')->nullable()->after('email');
            $table->string('campus')->nullable()->after('telephone');
            $table->string('photo')->nullable()->after('campus');

            // Rôle admin : simple booléen, car "conducteur" n'est pas un rôle
            // fixe mais dépend de l'existence d'un driver_profile validé
            $table->boolean('is_admin')->default(false)->after('photo');

            // Permet à l'admin de désactiver un compte (EF-09) sans le supprimer
            $table->boolean('is_active')->default(true)->after('is_admin');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telephone', 'campus', 'photo', 'is_admin', 'is_active']);
        });
    }
};
