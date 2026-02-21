<?php

namespace App\Http\Requests\Superadmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePoliRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:50', Rule::unique('master_polis', 'code')],
            'name' => ['required', 'string', 'max:120', Rule::unique('master_polis', 'name')],
            'is_active' => ['nullable', 'boolean'],
            'supports_obstetri' => ['nullable', 'boolean'],
        ];
    }
}
