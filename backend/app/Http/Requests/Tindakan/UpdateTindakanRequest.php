<?php

namespace App\Http\Requests\Tindakan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTindakanRequest extends FormRequest
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
        $id = (int) $this->route('id');
        return [
            'kode' => ['sometimes', 'string', 'max:30', Rule::unique('tindakan', 'kode')->ignore($id)],
            'nama' => ['sometimes', 'string', 'max:255'],
            'kategori' => ['sometimes', 'string', 'max:80'],
            'tarif' => ['sometimes', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
