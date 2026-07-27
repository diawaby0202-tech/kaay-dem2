<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateDriverRequestStatusRequest;
use App\Models\DriverProfile;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminDriverRequestController extends Controller
{
    /** GET /api/v1/admin/driver-requests (EF-02, EF-09) */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('admin');

        $demandes = DriverProfile::query()
            ->with('user')
            ->orderByDesc('created_at')
            ->paginate(15);

        return JsonResource::collection($demandes);
    }

    /** PATCH /api/v1/admin/driver-requests/{driverProfile} — valider ou rejeter (EF-02) */
    public function update(UpdateDriverRequestStatusRequest $request, DriverProfile $driverProfile): JsonResource
    {
        $driverProfile->update(['statut_validation' => $request->statut_validation]);

        return new JsonResource($driverProfile->load('user'));
    }
}
