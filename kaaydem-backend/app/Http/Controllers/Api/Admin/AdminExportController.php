<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminExportController extends Controller
{
    /**
     * GET /api/v1/admin/trips/export
     * Exigence bonus : export CSV des trajets pour l'administrateur.
     * Réponse en flux (StreamedResponse) plutôt qu'une chaîne construite
     * en mémoire : reste léger même si le nombre de trajets grandit.
     */
    public function trips(): StreamedResponse
    {
        $this->authorize('admin');

        $nomFichier = 'trajets-kaaydem-'.now()->format('Y-m-d_His').'.csv';

        $callback = function () {
            $handle = fopen('php://output', 'w');

            // BOM UTF-8 : évite les accents mal affichés à l'ouverture
            // du fichier dans Excel sous Windows
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'ID', 'Ville départ', 'Ville arrivée', 'Date/heure départ',
                'Places totales', 'Places disponibles', 'Prix par place (FCFA)',
                'Statut', 'Conducteur', 'Email conducteur', 'Publié le',
            ], ';');

            Trip::query()
                ->with('driver')
                ->withTrashed()
                ->orderByDesc('created_at')
                ->chunk(200, function ($trajets) use ($handle) {
                    foreach ($trajets as $trajet) {
                        fputcsv($handle, [
                            $trajet->id,
                            $trajet->ville_depart,
                            $trajet->ville_arrivee,
                            $trajet->date_heure_depart,
                            $trajet->places_totales,
                            $trajet->places_disponibles,
                            $trajet->prix_par_place,
                            $trajet->statut->value,
                            $trajet->driver->name,
                            $trajet->driver->email,
                            $trajet->created_at,
                        ], ';');
                    }
                });

            fclose($handle);
        };

        return response()->streamDownload($callback, $nomFichier, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
