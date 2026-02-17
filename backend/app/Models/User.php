<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'dokter_id',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * @return BelongsToMany<Role, $this>
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    /**
     * @return HasMany<UserPoli, $this>
     */
    public function poliAssignments(): HasMany
    {
        return $this->hasMany(UserPoli::class);
    }

    public function hasRole(string $roleName): bool
    {
        return $this->roles()
            ->where('name', $roleName)
            ->exists();
    }

    public function hasPermission(string $permissionName): bool
    {
        if ($this->hasRole('superadmin')) {
            return true;
        }

        return $this->roles()
            ->whereHas('permissions', fn ($query) => $query->where('name', $permissionName))
            ->exists();
    }

    /**
     * @return list<string>
     */
    public function permissionNames(): array
    {
        if ($this->hasRole('superadmin')) {
            return config('rbac.permissions', []);
        }

        return $this->roles()
            ->with('permissions')
            ->get()
            ->flatMap(fn (Role $role) => $role->permissions->pluck('name'))
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return list<string>
     */
    public function roleNames(): array
    {
        return $this->roles()
            ->pluck('name')
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return list<string>
     */
    public function poliScopes(): array
    {
        return $this->poliAssignments()
            ->pluck('poli')
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Get the identifier that will be stored in the JWT subject claim.
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * @return array<string, mixed>
     */
    public function getJWTCustomClaims(): array
    {
        return [];
    }
}
