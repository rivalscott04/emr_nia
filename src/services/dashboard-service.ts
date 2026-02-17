import { apiRequest } from "../lib/api-client"
import type { DashboardSummary } from "../types/dashboard"

export const DashboardService = {
    getSummary: async (): Promise<DashboardSummary> => {
        return apiRequest<DashboardSummary>("/api/dashboard/summary")
    },
}

