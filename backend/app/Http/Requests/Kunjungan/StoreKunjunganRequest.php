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
            'td_sistole' => ['required', 'integer', 'min:0', 'max:300'],
            'td_diastole' => ['required', 'integer', 'min:0', 'max:200'],
            'berat_badan' => ['required', 'numeric', 'min:0', 'max:500'],
            'tinggi_badan' => ['required', 'numeric', 'min:0', 'max:300'],
            'hpht' => ['nullable', 'date'],
            'htp' => ['nullable', 'date'],
            'gravida' => ['nullable', 'integer', 'min:0', 'max:20'],
            'para' => ['nullable', 'integer', 'min:0', 'max:20'],
            'form_hidup' => ['nullable', 'integer', 'min:0', 'max:20'],
            'abortus' => ['nullable', 'integer', 'min:0', 'max:20'],
        ];
    }
}

