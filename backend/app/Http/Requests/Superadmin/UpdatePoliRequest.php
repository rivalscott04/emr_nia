<?php

namespace App\Http\Requests\Superadmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePoliRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:50', Rule::unique('master_polis', 'code')->ignore($this->route('id'))],
            'name' => ['required', 'string', 'max:120', Rule::unique('master_polis', 'name')->ignore($this->route('id'))],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
