<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Portefeuille virtuel (exigence bonus : paiement simulé).
            // 10 000 FCFA de départ pour chaque nouveau compte, afin de
            // pouvoir tester des réservations dès l'inscription sans étape
            // de "rechargement" (hors périmètre de la simulation).
            $table->decimal('solde', 10, 2)->default(10000)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('solde');
        });
    }
};
