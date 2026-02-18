<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ApotekerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = \App\Models\Role::firstOrCreate(['name' => 'apoteker']);

        // Create Apoteker User
        $user = \App\Models\User::firstOrCreate(
            ['email' => 'apoteker@emr.com'],
            [
                'name' => 'Apoteker Nia',
                'username' => 'apoteker',
                'password' => bcrypt('password'), // password default
                'email_verified_at' => now(),
            ]
        );

        $user->roles()->syncWithoutDetaching([$role->id]);

        $this->command->info('User Apoteker berhasil dibuat: apoteker@emr.com / password');
    }
}
