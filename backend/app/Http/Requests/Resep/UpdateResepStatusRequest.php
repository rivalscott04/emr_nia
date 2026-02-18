<?php

namespace App\Http\Requests\Resep;

use Illuminate\Foundation\Http\FormRequest;

class UpdateResepStatusRequest extends FormRequest
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
            'status' => ['required', 'string', 'in:Processed,Done'],
        ];
    }
}
