import { apiRequest } from "../lib/api-client"
import type { AuthUser, LoginResponse } from "../types/auth"

export const AuthService = {
    login: async (login: string, password: string): Promise<LoginResponse> => {
        return apiRequest<LoginResponse>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ login, password }),
        })
    },
    me: async (): Promise<AuthUser> => {
        return apiRequest<AuthUser>("/api/auth/me")
    },
    logout: async (): Promise<void> => {
        await apiRequest<null>("/api/auth/logout", {
            method: "POST",
        })
    },
}
