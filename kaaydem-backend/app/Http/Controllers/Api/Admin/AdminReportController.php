<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateReportStatusRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminReportController extends Controller
{
    /** GET /api/v1/admin/reports (EF-09) */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('admin');

        $signalements = Report::query()
            ->with(['auteur', 'utilisateurSignale'])
            ->orderByDesc('created_at')
            ->paginate(15);

        return ReportResource::collection($signalements);
    }

    /** PATCH /api/v1/admin/reports/{report} — marquer traité/rejeté (EF-09) */
    public function update(UpdateReportStatusRequest $request, Report $report): ReportResource
    {
        $report->update(['statut_traitement' => $request->statut_traitement]);

        return new ReportResource($report->load(['auteur', 'utilisateurSignale']));
    }
}
