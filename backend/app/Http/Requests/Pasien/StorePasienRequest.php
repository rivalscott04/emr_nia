<?php

namespace App\Http\Requests\Pasien;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePasienRequest extends FormRequest
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
            'id' => ['prohibited'],
            'nik' => ['required', 'string', 'regex:/^[0-9]{16}$/', 'unique:pasiens,nik'],
            'no_rm' => ['prohibited'],
            'nama' => ['required', 'string', 'max:255'],
            'tanggal_lahir' => ['required', 'date'],
            'jenis_kelamin' => ['required', Rule::in(['L', 'P'])],
            'alamat' => ['required', 'string'],
            'no_hp' => ['required', 'string', 'regex:/^[0-9]{8,13}$/'],
            'allergies' => ['prohibited'],
            'created_at' => ['prohibited'],
            'updated_at' => ['prohibited'],
            'golongan_darah' => ['nullable', 'string', 'max:20'],
            'pekerjaan' => ['nullable', 'string', 'max:255'],
            'status_pernikahan' => ['nullable', 'string', 'max:100'],
            'nama_ibu_kandung' => ['nullable', 'string', 'max:255'],
            'nama_suami' => ['nullable', 'string', 'max:255'],
        ];
    }
}

