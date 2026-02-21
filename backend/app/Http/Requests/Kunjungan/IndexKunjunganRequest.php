<?php

namespace App\Http\Requests\Kunjungan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexKunjunganRequest extends FormRequest
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
            'pasien_id' => ['nullable', 'string', 'max:64'],
            'status' => ['nullable', Rule::in(['OPEN', 'SEDANG_DIPERIKSA', 'COMPLETED', 'CANCELLED'])],
            'tanggal' => ['nullable', 'date'],
            'q' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}

