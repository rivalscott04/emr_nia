<?php

namespace App\Http\Requests\Pasien;

use Illuminate\Foundation\Http\FormRequest;

class ExportPasienRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user || ! $user->hasRole('dokter')) {
            return false;
        }
        if (! $user->dokter_id) {
            return false;
        }

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'limit' => ['required', 'integer', 'min:1', 'max:10000'],
            'format' => ['required', 'string', 'in:csv,pdf'],
        ];
    }

    public function messages(): array
    {
        return [
            'limit.required' => 'Jumlah pasien yang akan diexport harus diisi.',
            'limit.min' => 'Minimum 1 pasien.',
            'limit.max' => 'Maksimum 10.000 pasien per export.',
            'format.required' => 'Format export (CSV/PDF) harus dipilih.',
            'format.in' => 'Format harus csv atau pdf.',
        ];
    }
}
