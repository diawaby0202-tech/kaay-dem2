<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminUserController extends Controller
{
    /** GET /api/v1/admin/users (EF-09) */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('admin');

        $users = User::query()
            ->with('driverProfile')
            ->orderByDesc('created_at')
            ->paginate(15);

        return UserResource::collection($users);
    }

    /** PATCH /api/v1/admin/users/{user} — activation/désactivation (EF-09) */
    public function update(UpdateUserStatusRequest $request, User $user): UserResource
    {
        $user->update(['is_active' => $request->boolean('is_active')]);

        return new UserResource($user->load('driverProfile'));
    }
}
