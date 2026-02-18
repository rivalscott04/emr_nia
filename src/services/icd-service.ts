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
// Frequently used procedures (ICD-9, quick-select)
// ========================================

export const FREQUENT_PROCEDURES: ICD[] = [
    { code: "89.52", name: "EKG / Elektrokardiogram (Electrocardiogram)" },
    { code: "88.76", name: "USG abdomen (Diagnostic ultrasound of abdomen)" },
    { code: "57.94", name: "Kateter urine (Insertion of indwelling urinary catheter)" },
    { code: "96.07", name: "NGT (Insertion of nasogastric tube)" },
    { code: "93.99", name: "Nebulizer / Terapi inhalasi (Other respiratory therapy)" },
    { code: "99.21", name: "Suntik antibiotik (Injection of antibiotic)" },
    { code: "99.04", name: "Transfusi PRC (Transfusion of packed cells)" },
    { code: "38.93", name: "Pemasangan infus (Venous catheterization)" },
    { code: "96.04", name: "Intubasi endotrakeal (Insertion of endotracheal tube)" },
    { code: "87.03", name: "CT scan kepala (Computerized axial tomography of head)" },
    { code: "86.22", name: "Debridemen luka (Excisional debridement)" },
    { code: "86.59", name: "Jahit luka / Sutur (Other repair of skin)" },
]

// ========================================
// Service
// ========================================

function searchIcd(type: "ICD-10" | "ICD-9", query: string): Promise<ICD[]> {
    if (!query) return Promise.resolve([])
    const params = new URLSearchParams({
        q: query,
        type,
        limit: "15",
    })
    return apiRequest<{ items: Array<{ code: string; name: string }>; total: number }>(`/api/icd/search?${params.toString()}`).then((data) =>
        data.items.map((item) => ({ code: item.code, name: item.name }))
    )
}

export const ICDService = {
    searchICD10: (query: string) => searchIcd("ICD-10", query),

    searchICD9: (query: string) => searchIcd("ICD-9", query),

    getFrequent: async (): Promise<ICD[]> => {
        return FREQUENT_DIAGNOSES
    },
}
