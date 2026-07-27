<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // nullOnDelete plutôt que cascade : on garde l'historique
            // financier même si la réservation d'origine est supprimée
            $table->foreignId('reservation_id')
                ->nullable()
                ->constrained('reservations')
                ->nullOnDelete();

            $table->string('type'); // 'debit' ou 'credit' (enum TransactionType)
            $table->decimal('montant', 10, 2);
            $table->string('description');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
