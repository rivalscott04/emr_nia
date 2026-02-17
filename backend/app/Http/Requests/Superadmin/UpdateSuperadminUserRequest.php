<?php

namespace App\Http\Requests\Superadmin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSuperadminUserRequest extends FormRequest
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
        $roleNames = array_keys(config('rbac.roles', []));

        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('users', 'username')->ignore($this->route('id')),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->route('id')),
            ],
            'dokter_id' => ['nullable', 'string', 'max:100'],
            'role_names' => ['required', 'array', 'min:1'],
            'role_names.*' => ['string', Rule::in($roleNames)],
            'poli_scopes' => ['nullable', 'array'],
            'poli_scopes.*' => ['string', 'max:120'],
        ];
    }
}
