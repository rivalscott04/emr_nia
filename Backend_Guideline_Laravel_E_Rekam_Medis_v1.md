# Backend Development Guideline

## E-Rekam Medis System (Laravel Architecture v1.0)

------------------------------------------------------------------------

# 1. Architecture Principles

Backend harus mengikuti prinsip:

1.  Clean Architecture
2.  Separation of Concerns
3.  Controller hanya untuk Request & Response
4.  Business Logic di Service Layer
5.  Reusable & Maintainable
6.  Siap scale & audit-ready

------------------------------------------------------------------------

# 2. Layered Architecture Structure

app/ ├── Http/ │ ├── Controllers/ │ ├── Requests/ │ └── Resources/ ├──
Services/ ├── Repositories/ ├── Models/ ├── DTOs/ └── Policies/

Rules: - Controller tidak boleh berisi business logic. - Query kompleks
tidak ditulis di Controller. - Semua logic berada di Service Layer.

------------------------------------------------------------------------

# 3. Controller Rules

Controller hanya bertugas:

-   Validasi request (via FormRequest)
-   Memanggil Service
-   Mengembalikan Response (API Resource)

Contoh struktur:

class PasienController extends Controller { public function
store(StorePasienRequest \$request) { \$pasien =
$this->pasienService->create($request-\>validated()); return new
PasienResource(\$pasien); } }

Dilarang: - Query langsung di controller - Logic perhitungan -
Manipulasi data kompleks

------------------------------------------------------------------------

# 4. Service Layer Rules

Service bertanggung jawab atas:

-   Business Logic
-   Transaction handling
-   Validasi domain
-   Orchestrasi antar model

Gunakan DB::transaction() jika melibatkan lebih dari satu tabel.

Semua logic harus dapat dites via Unit Test.

------------------------------------------------------------------------

# 5. Repository Pattern (Opsional tapi Direkomendasikan)

Gunakan Repository jika:

-   Query kompleks
-   Banyak join
-   Perlu abstraction

Repository bertugas: - Menyediakan query reusable - Menghindari
duplikasi query

------------------------------------------------------------------------

# 6. Eloquent Best Practices

## 6.1 Hindari N+1 Query

WAJIB menggunakan eager loading:

with() load()

Contoh:

Kunjungan::with(\['pasien', 'dokter', 'resep'\])-\>get();

Dilarang:

foreach (\$kunjungan as \$k) { \$k-\>pasien; }

Gunakan Laravel Debugbar saat development untuk mendeteksi N+1.

------------------------------------------------------------------------

## 6.2 Gunakan Relationship dengan Benar

Model harus memiliki relationship jelas:

-   hasMany
-   belongsTo
-   belongsToMany

Jangan gunakan query manual jika bisa pakai relationship.

------------------------------------------------------------------------

## 6.3 Gunakan Scope

Gunakan Local Scope untuk query yang sering dipakai.

Contoh: scopeActive() scopeToday()

------------------------------------------------------------------------

# 7. Validation Strategy

Gunakan FormRequest.

Semua validasi harus berada di:

app/Http/Requests/

Dilarang validasi manual di controller.

------------------------------------------------------------------------

# 8. API Response Standard

Gunakan API Resource:

app/Http/Resources/

Response harus konsisten:

{ "success": true, "message": "","data": {} }

Error response harus konsisten dan jelas.

------------------------------------------------------------------------

# 9. Database Rules

-   Gunakan Migration
-   Gunakan Foreign Key Constraint
-   Gunakan Index pada kolom penting (nik, foreign keys)
-   Gunakan SoftDeletes untuk data medis

Rekam medis tidak boleh hard delete.

------------------------------------------------------------------------

# 10. Transaction Rules

Gunakan DB::transaction() untuk:

-   Buat kunjungan + SOAP
-   Buat resep + detail resep
-   Proses kompleks multi tabel

Pastikan rollback jika gagal.

------------------------------------------------------------------------

# 11. Security Best Practices

-   Gunakan Sanctum atau Passport untuk API auth
-   Password wajib hash (bcrypt default Laravel)
-   Gunakan Policy untuk authorization
-   Jangan expose model sensitif

------------------------------------------------------------------------

# 12. Logging & Audit

Gunakan:

-   Model Events (created, updated)
-   Observer jika perlu
-   AuditLog table

Semua perubahan SOAP dan Resep wajib tercatat.

------------------------------------------------------------------------

# 13. Performance Optimization

-   Hindari select \*
-   Gunakan select kolom yang dibutuhkan
-   Gunakan pagination
-   Gunakan caching untuk master data (poli, dokter)

------------------------------------------------------------------------

# 14. Testing Strategy

Minimal:

-   Feature Test untuk endpoint utama
-   Unit Test untuk Service Layer

Semua business logic harus bisa dites tanpa controller.

------------------------------------------------------------------------

# 15. Coding Standards

-   PSR-12
-   Gunakan type hinting
-   Gunakan return type
-   Gunakan strict typing jika memungkinkan

------------------------------------------------------------------------

# 16. Folder Naming Convention

Service: PasienService KunjunganService ResepService

Repository: PasienRepository KunjunganRepository

Gunakan satu service per domain utama.

------------------------------------------------------------------------

# 17. Final Backend Philosophy

1.  Controller tipis
2.  Service tebal
3.  Query efisien
4.  Tidak ada N+1
5.  Siap scale
6.  Siap audit BPJS
7.  Mudah di-maintain 5 tahun ke depan

------------------------------------------------------------------------

End of Document
