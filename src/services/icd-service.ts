import { apiRequest } from "../lib/api-client"

export interface ICD {
    code: string
    name: string
}

// ========================================
// Frequently used diagnoses (quick-select)
// ========================================

export const FREQUENT_DIAGNOSES: ICD[] = [
    { code: "J06.9", name: "ISPA (Acute upper respiratory infection)" },
    { code: "I10", name: "Hipertensi (Essential hypertension)" },
    { code: "E11.9", name: "DM Tipe 2 tanpa komplikasi" },
    { code: "K30", name: "Dispepsia (Functional dyspepsia)" },
    { code: "K29", name: "Gastritis" },
    { code: "R50.9", name: "Demam (Fever, unspecified)" },
    { code: "R51", name: "Sakit kepala (Headache)" },
    { code: "M79.1", name: "Myalgia" },
    { code: "A09", name: "Diare (Gastroenteritis)" },
    { code: "N39.0", name: "ISK (Urinary tract infection)" },
    { code: "L50", name: "Urtikaria (Urticaria)" },
    { code: "R42", name: "Vertigo (Dizziness)" },
]

// ========================================
// Service
// ========================================

export const ICDService = {
    searchICD10: async (query: string): Promise<ICD[]> => {
        if (!query) return []
        const params = new URLSearchParams({
            q: query,
            type: "ICD-10",
            limit: "15",
        })
        const data = await apiRequest<{ items: Array<{ code: string; name: string }>; total: number }>(`/api/icd/search?${params.toString()}`)
        return data.items.map((item) => ({ code: item.code, name: item.name }))
    },

    getFrequent: async (): Promise<ICD[]> => {
        return FREQUENT_DIAGNOSES
    },
}
