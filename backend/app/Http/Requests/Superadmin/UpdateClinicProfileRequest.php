<?php

namespace App\Http\Requests\Superadmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClinicProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nama' => ['nullable', 'string', 'max:255'],
            'telepon' => ['nullable', 'string', 'max:64'],
            'alamat' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
