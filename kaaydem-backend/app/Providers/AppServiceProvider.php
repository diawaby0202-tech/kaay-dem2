<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Règle globale : "admin" = true seulement si is_admin est vrai.
        // Utilisée dans les contrôleurs admin via $this->authorize('admin').
        Gate::define('admin', fn (User $user) => $user->is_admin);

        // Carbon a son propre réglage de langue, indépendant de la config
        // "app.locale" de Laravel : sans cette ligne, translatedFormat()
        // (utilisé dans les e-mails de réservation) affiche les dates en
        // anglais même si APP_LOCALE=fr est défini dans .env.
        Carbon::setLocale(config('app.locale'));
    }
}
