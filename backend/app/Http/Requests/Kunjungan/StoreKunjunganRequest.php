<?php

namespace App\Http\Requests\Kunjungan;

use Illuminate\Foundation\Http\FormRequest;

class StoreKunjunganRequest extends FormRequest
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
            'pasien_id' => ['required', 'string'],
            'dokter_id' => ['required', 'string', 'max:50'],
            'poli' => ['required', 'string', 'max:100'],
            'keluhan_utama' => ['required', 'string', 'min:5'],
        ];
    }
}

