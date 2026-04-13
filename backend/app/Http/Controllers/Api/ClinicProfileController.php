<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Superadmin\UpdateClinicProfileRequest;
use App\Http\Resources\ClinicProfileResource;
use App\Services\ClinicProfileService;
use Illuminate\Http\JsonResponse;

class ClinicProfileController extends Controller
{
    public function __construct(
        private readonly ClinicProfileService $clinicProfileService
    ) {}

    public function show(): JsonResponse
    {
        $profile = $this->clinicProfileService->getSingleton();

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => new ClinicProfileResource($profile),
        ]);
    }

    public function update(UpdateClinicProfileRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $profile = $this->clinicProfileService->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil klinik disimpan.',
            'data' => new ClinicProfileResource($profile),
        ]);
    }
}
