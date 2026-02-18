<?php

namespace App\Http\Requests\Tindakan;

use Illuminate\Foundation\Http\FormRequest;

class StoreTindakanRequest extends FormRequest
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
            'kode' => ['required', 'string', 'max:30', 'unique:tindakan,kode'],
            'nama' => ['required', 'string', 'max:255'],
            'kategori' => ['required', 'string', 'max:80'],
            'tarif' => ['required', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
