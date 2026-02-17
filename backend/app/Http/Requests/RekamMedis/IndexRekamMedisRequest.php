<?php

namespace App\Http\Requests\RekamMedis;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexRekamMedisRequest extends FormRequest
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
            'tanggal' => ['nullable', 'date'],
            'pasien_id' => ['nullable', 'string'],
            'dokter_id' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['Draft', 'Final'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}

