<?php

namespace App\Http\Requests\RekamMedis;

use Illuminate\Foundation\Http\FormRequest;

class AddendumRekamMedisRequest extends FormRequest
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
            'catatan' => ['required', 'string', 'min:3'],
            'dokter' => ['nullable', 'string', 'max:255'],
        ];
    }
}

