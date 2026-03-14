<?php

namespace App\Http\Requests\Kunjungan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKunjunganRequest extends FormRequest
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
            'status' => ['sometimes', Rule::in(['OPEN', 'SEDANG_DIPERIKSA', 'COMPLETED', 'CANCELLED'])],
            'td_sistole' => ['nullable', 'integer', 'min:0', 'max:300'],
            'td_diastole' => ['nullable', 'integer', 'min:0', 'max:200'],
            'berat_badan' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'tinggi_badan' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'hpht' => ['nullable', 'date'],
            'htp' => ['nullable', 'date'],
            'gravida' => ['nullable', 'integer', 'min:0', 'max:20'],
            'para' => ['nullable', 'integer', 'min:0', 'max:20'],
            'form_hidup' => ['nullable', 'integer', 'min:0', 'max:20'],
            'abortus' => ['nullable', 'integer', 'min:0', 'max:20'],
        ];
    }
}
