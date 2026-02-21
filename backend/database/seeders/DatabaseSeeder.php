<?php

namespace Database\Seeders;

use App\Models\Kunjungan;
use App\Models\MasterPoli;
use App\Models\Pasien;
use App\Models\PasienAllergy;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $permissions = collect(config('rbac.permissions', []))
            ->mapWithKeys(fn (string $name) => [
                $name => Permission::query()->firstOrCreate(['name' => $name]),
            ]);

        foreach (config('rbac.roles', []) as $roleName => $rolePermissions) {
            $role = Role::query()->firstOrCreate(['name' => $roleName]);
            $role->permissions()->sync(
                collect($rolePermissions)
                    ->map(fn (string $permissionName) => $permissions[$permissionName]?->id)
                    ->filter()
                    ->values()
                    ->all()
            );
        }

        $superadmin = User::query()->updateOrCreate(
            ['email' => 'superadmin@emrnia.local'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('password123'),
            ]
        );
        $superadmin->roles()->syncWithoutDetaching(
            Role::query()->where('name', 'superadmin')->pluck('id')->all()
        );

        foreach ([
            ['code' => 'UMUM', 'name' => 'Umum'],
            ['code' => 'GIGI', 'name' => 'Gigi'],
            ['code' => 'KIA', 'name' => 'KIA'],
        ] as $poliSeed) {
            MasterPoli::query()->updateOrCreate(
                ['code' => $poliSeed['code']],
                [
                    'name' => $poliSeed['name'],
                    'is_active' => true,
                ]
            );
        }

        $this->call(MasterIcdCodeSeeder::class);
        $this->call(TindakanSeeder::class);

        $dokterRoleIds = Role::query()->where('name', 'dokter')->pluck('id')->all();
        $adminPoliRoleIds = Role::query()->where('name', 'admin_poli')->pluck('id')->all();

        $poliDokterSeeds = [
            [
                'poli' => 'Umum',
                'dokter' => [
                    'name' => 'dr. Andi Pratama',
                    'username' => 'dokter_umum',
                    'email' => 'dr.andi@emrnia.local',
                    'dokter_id' => 'D-01',
                ],
                'admin' => [
                    'name' => 'Admin Poli Umum',
                    'username' => 'admin_umum',
                    'email' => 'admin.umum@emrnia.local',
                ],
            ],
            [
                'poli' => 'Gigi',
                'dokter' => [
                    'name' => 'drg. Siti Maharani',
                    'username' => 'dokter_gigi',
                    'email' => 'drg.siti@emrnia.local',
                    'dokter_id' => 'D-02',
                ],
                'admin' => [
                    'name' => 'Admin Poli Gigi',
                    'username' => 'admin_gigi',
                    'email' => 'admin.gigi@emrnia.local',
                ],
            ],
            [
                'poli' => 'KIA',
                'dokter' => [
                    'name' => 'dr. Bima Saputra',
                    'username' => 'dokter_kia',
                    'email' => 'dr.bima@emrnia.local',
                    'dokter_id' => 'D-03',
                ],
                'admin' => [
                    'name' => 'Admin Poli KIA',
                    'username' => 'admin_kia',
                    'email' => 'admin.kia@emrnia.local',
                ],
            ],
        ];

        foreach ($poliDokterSeeds as $seed) {
            $dokter = User::query()->updateOrCreate(
                ['email' => $seed['dokter']['email']],
                [
                    'name' => $seed['dokter']['name'],
                    'username' => $seed['dokter']['username'],
                    'dokter_id' => $seed['dokter']['dokter_id'],
                    'password' => Hash::make('password123'),
                ]
            );
            $dokter->roles()->syncWithoutDetaching($dokterRoleIds);
            $dokter->poliAssignments()->updateOrCreate(
                ['poli' => $seed['poli']],
                ['user_id' => $dokter->id]
            );

            $adminPoli = User::query()->updateOrCreate(
                ['email' => $seed['admin']['email']],
                [
                    'name' => $seed['admin']['name'],
                    'username' => $seed['admin']['username'],
                    'password' => Hash::make('password123'),
                ]
            );
            $adminPoli->roles()->syncWithoutDetaching($adminPoliRoleIds);
            $adminPoli->poliAssignments()->updateOrCreate(
                ['poli' => $seed['poli']],
                ['user_id' => $adminPoli->id]
            );
        }

        $pasienSeeds = [
            [
                'nik' => '3174011203900001',
                'no_rm' => '260217-AB12',
                'nama' => 'Budi Santoso',
                'tanggal_lahir' => '1990-03-12',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Merdeka No. 10, Jakarta',
                'no_hp' => '081234567890',
                'golongan_darah' => 'O',
                'pekerjaan' => 'Karyawan Swasta',
                'status_pernikahan' => 'Menikah',
                'nama_ibu_kandung' => 'Sulastri',
                'allergies' => ['Amoxicillin'],
            ],
            [
                'nik' => '3174012808920002',
                'no_rm' => '260217-CD34',
                'nama' => 'Siti Aminah',
                'tanggal_lahir' => '1992-08-28',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Cempaka No. 5, Jakarta',
                'no_hp' => '081298765432',
                'golongan_darah' => 'A',
                'pekerjaan' => 'Guru',
                'status_pernikahan' => 'Menikah',
                'nama_ibu_kandung' => 'Rohani',
                'allergies' => ['Ibuprofen'],
            ],
            [
                'nik' => '3174011501850003',
                'no_rm' => '260217-EF56',
                'nama' => 'Joko Prasetyo',
                'tanggal_lahir' => '1985-01-15',
                'jenis_kelamin' => 'L',
                'alamat' => 'Jl. Kenanga No. 21, Jakarta',
                'no_hp' => '081377788899',
                'golongan_darah' => 'B',
                'pekerjaan' => 'Wiraswasta',
                'status_pernikahan' => 'Menikah',
                'nama_ibu_kandung' => 'Wati',
                'allergies' => [],
            ],
            [
                'nik' => '3174010407970004',
                'no_rm' => '260217-GH78',
                'nama' => 'Dewi Lestari',
                'tanggal_lahir' => '1997-07-04',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Anggrek No. 3, Jakarta',
                'no_hp' => '081355566677',
                'golongan_darah' => 'AB',
                'pekerjaan' => 'Perawat',
                'status_pernikahan' => 'Belum Menikah',
                'nama_ibu_kandung' => 'Nurhayati',
                'allergies' => ['Paracetamol'],
            ],
            [
                'nik' => '3174012206020005',
                'no_rm' => '260217-IJ90',
                'nama' => 'Rina Marlina',
                'tanggal_lahir' => '2002-06-22',
                'jenis_kelamin' => 'P',
                'alamat' => 'Jl. Dahlia No. 8, Jakarta',
                'no_hp' => '081322233344',
                'golongan_darah' => 'O',
                'pekerjaan' => 'Mahasiswa',
                'status_pernikahan' => 'Belum Menikah',
                'nama_ibu_kandung' => 'Murni',
                'allergies' => ['Cetirizine', 'Aspirin'],
            ],
        ];

        $pasiensByNoRm = [];
        foreach ($pasienSeeds as $seed) {
            $allergies = $seed['allergies'];
            unset($seed['allergies']);

            $pasien = Pasien::query()->updateOrCreate(
                ['nik' => $seed['nik']],
                $seed
            );
            $pasiensByNoRm[$pasien->no_rm] = $pasien;

            foreach ($allergies as $allergyName) {
                PasienAllergy::query()->updateOrCreate(
                    [
                        'pasien_id' => $pasien->id,
                        'name_normalized' => Str::lower($allergyName),
                    ],
                    [
                        'name' => $allergyName,
                        'pasien_id' => $pasien->id,
                    ]
                );
            }
        }

        $kunjunganSeedIds = ['K-00001', 'K-00002', 'K-00003'];
        Kunjungan::query()->whereIn('id', $kunjunganSeedIds)->forceDelete();

        $kunjunganSeeds = [
            [
                'id' => 'K-00001',
                'no_rm' => '260217-AB12',
                'dokter_id' => 'D-01',
                'dokter_nama' => 'dr. Andi Pratama',
                'poli' => 'Umum',
                'kunjungan_ke' => 1,
                'keluhan_utama' => 'Demam dan batuk sejak 2 hari',
                'td_sistole' => 120,
                'td_diastole' => 80,
                'berat_badan' => 70.5,
                'tinggi_badan' => 168.0,
                'status' => 'OPEN',
            ],
            [
                'id' => 'K-00002',
                'no_rm' => '260217-CD34',
                'dokter_id' => 'D-02',
                'dokter_nama' => 'drg. Siti Maharani',
                'poli' => 'Gigi',
                'kunjungan_ke' => 1,
                'keluhan_utama' => 'Sakit gigi geraham kanan bawah',
                'td_sistole' => 110,
                'td_diastole' => 75,
                'berat_badan' => 55.0,
                'tinggi_badan' => 158.0,
                'status' => 'COMPLETED',
            ],
            [
                'id' => 'K-00003',
                'no_rm' => '260217-EF56',
                'dokter_id' => 'D-01',
                'dokter_nama' => 'dr. Andi Pratama',
                'poli' => 'Umum',
                'kunjungan_ke' => 1,
                'keluhan_utama' => 'Pusing dan lemas',
                'td_sistole' => 130,
                'td_diastole' => 85,
                'berat_badan' => 72.0,
                'tinggi_badan' => 170.0,
                'status' => 'OPEN',
            ],
        ];

        foreach ($kunjunganSeeds as $k) {
            $pasien = $pasiensByNoRm[$k['no_rm']] ?? null;
            if (! $pasien) {
                continue;
            }
            $id = $k['id'];
            unset($k['no_rm'], $k['id']);
            Kunjungan::query()->updateOrCreate(
                ['id' => $id],
                [
                    'pasien_id' => $pasien->id,
                    'pasien_nama' => $pasien->nama,
                    'dokter_id' => $k['dokter_id'],
                    'dokter_nama' => $k['dokter_nama'],
                    'poli' => $k['poli'],
                    'kunjungan_ke' => $k['kunjungan_ke'],
                    'tanggal' => now()->subDays(rand(0, 3)),
                    'keluhan_utama' => $k['keluhan_utama'],
                    'td_sistole' => $k['td_sistole'],
                    'td_diastole' => $k['td_diastole'],
                    'berat_badan' => $k['berat_badan'],
                    'tinggi_badan' => $k['tinggi_badan'],
                    'status' => $k['status'],
                ]
            );
        }
    }
}
