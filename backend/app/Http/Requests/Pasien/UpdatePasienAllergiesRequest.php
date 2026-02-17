<?php

namespace App\Http\Requests\Pasien;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePasienAllergiesRequest extends FormRequest
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
            'allergies' => ['required', 'array', 'max:50'],
            'allergies.*' => ['required', 'string', 'max:255'],
        ];
    }
}

