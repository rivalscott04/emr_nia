<?php

namespace App\Http\Requests\Tindakan;

use Illuminate\Foundation\Http\FormRequest;

class IndexTindakanRequest extends FormRequest
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
            'q' => ['nullable', 'string', 'max:255'],
            'kategori' => ['nullable', 'string', 'max:80'],
            'page' => ['nullable', 'integer', 'min:1'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:100'],
            'include_inactive' => ['nullable', 'boolean'],
        ];
    }
}
