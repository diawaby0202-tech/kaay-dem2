<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\TripStatus;
use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    /** GET /api/v1/admin/stats (EF-08) */
    public function index(): JsonResponse
    {
        $this->authorize('admin');

        return response()->json([
            'trajets_par_mois' => $this->trajetsParMois(),
            'taux_occupation_moyen' => $this->tauxOccupationMoyen(),
            'top_conducteurs' => $this->topConducteurs(),
        ]);
    }

    /** Nombre de trajets publiés par mois, sur les 6 derniers mois */
    private function trajetsParMois(): array
    {
        $debut = Carbon::now()->subMonths(5)->startOfMonth();

        $resultats = Trip::query()
            ->selectRaw("strftime('%Y-%m', created_at) as mois, COUNT(*) as total")
            ->where('created_at', '>=', $debut)
            ->groupBy('mois')
            ->orderBy('mois')
            ->get()
            ->keyBy('mois');

        // On complète les mois sans aucun trajet avec un total à 0,
        // pour que le graphique (EF-08) affiche une courbe continue
        $moisComplets = [];
        for ($i = 5; $i >= 0; $i--) {
            $cle = Carbon::now()->subMonths($i)->format('Y-m');
            $moisComplets[] = [
                'mois' => $cle,
                'total' => (int) ($resultats[$cle]->total ?? 0),
            ];
        }

        return $moisComplets;
    }

    /** Moyenne du taux de remplissage sur les trajets non annulés */
    private function tauxOccupationMoyen(): float
    {
        $trajets = Trip::where('statut', '!=', TripStatus::Annule)
            ->get(['places_totales', 'places_disponibles']);

        if ($trajets->isEmpty()) {
            return 0.0;
        }

        $taux = $trajets->map(function (Trip $trajet) {
            $placesOccupees = $trajet->places_totales - $trajet->places_disponibles;

            return $trajet->places_totales > 0
                ? $placesOccupees / $trajet->places_totales
                : 0;
        });

        return round($taux->avg() * 100, 1); // en pourcentage
    }

    /** Top 5 conducteurs par nombre de trajets terminés, avec leur note moyenne */
    private function topConducteurs(): array
    {
        $topDrivers = Trip::query()
            ->select('driver_id', DB::raw('COUNT(*) as nombre_trajets'))
            ->where('statut', TripStatus::Termine)
            ->groupBy('driver_id')
            ->orderByDesc('nombre_trajets')
            ->limit(5)
            ->get();

        return $topDrivers->map(function ($ligne) {
            $conducteur = User::find($ligne->driver_id);

            return [
                'id' => $conducteur->id,
                'name' => $conducteur->name,
                'nombre_trajets' => $ligne->nombre_trajets,
                'note_moyenne' => $conducteur->noteMoyenne(),
            ];
        })->toArray();
    }
}
