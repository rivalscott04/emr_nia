<?php

namespace App\Http\Requests\RekamMedis;

use Illuminate\Foundation\Http\FormRequest;

class UpsertRekamMedisRequest extends FormRequest
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
            'soap' => ['present', 'array'],
            'soap.subjective' => ['nullable', 'string'],
            'soap.objective' => ['nullable', 'string'],
            'soap.assessment' => ['nullable', 'string'],
            'soap.plan' => ['nullable', 'string'],
            'soap.instruksi' => ['nullable', 'string'],

            'ttv' => ['present', 'array'],
            'ttv.sistole' => ['nullable', 'integer', 'min:0', 'max:400'],
            'ttv.diastole' => ['nullable', 'integer', 'min:0', 'max:300'],
            'ttv.nadi' => ['nullable', 'integer', 'min:0', 'max:300'],
            'ttv.rr' => ['nullable', 'integer', 'min:0', 'max:120'],
            'ttv.suhu' => ['nullable', 'numeric', 'min:20', 'max:50'],
            'ttv.spo2' => ['nullable', 'integer', 'min:0', 'max:100'],
            'ttv.berat_badan' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'ttv.tinggi_badan' => ['nullable', 'numeric', 'min:0', 'max:300'],

            'diagnosa' => ['nullable', 'array'],
            'diagnosa.*.code' => ['required_with:diagnosa', 'string', 'max:20'],
            'diagnosa.*.name' => ['required_with:diagnosa', 'string', 'max:255'],
            'diagnosa.*.type' => ['nullable', 'string', 'in:ICD-10,ICD-9'],
            'diagnosa.*.is_utama' => ['nullable', 'boolean'],

            'resep' => ['nullable', 'array'],
            'resep.*.nama_obat' => ['required_with:resep', 'string', 'max:255'],
            'resep.*.jumlah' => ['required_with:resep', 'string', 'max:100'],
            'resep.*.aturan_pakai' => ['required_with:resep', 'string'],
        ];
    }
}

