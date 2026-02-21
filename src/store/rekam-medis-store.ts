import { create } from "zustand"
import type { ICD } from "../services/icd-service"
import type {
    AddendumItem,
    DiagnosaItem,
    RekamMedisDetail,
    RekamMedisPatient,
    RekamMedisStatus,
    ResepItem,
    ResepStatus,
    SOAPData,
    TTVData,
} from "../types/rekam-medis"

// ========================================
// Types
// ========================================

// ========================================
// Store
// ========================================

interface RekamMedisState {
    // Patient
    patient: RekamMedisPatient

    // Record status
    recordStatus: RekamMedisStatus
    resepStatus: ResepStatus

    // Form data
    soap: SOAPData
    ttv: TTVData
    diagnosaList: DiagnosaItem[]
    tindakanList: DiagnosaItem[]
    resepList: ResepItem[]

    // Addendum
    addendums: AddendumItem[]

    // Lampiran gambar pemeriksaan (canvas drawing)
    lampiranGambar: string | null

    // Hydration
    hydrateFromApi: (record: RekamMedisDetail) => void
    resetStore: () => void

    // Actions — SOAP
    updateSOAP: (data: Partial<SOAPData>) => void

    // Actions — TTV
    updateTTV: (data: Partial<TTVData>) => void

    // Actions — Diagnosa (ICD-10)
    addDiagnosa: (icd: ICD | DiagnosaItem) => void
    removeDiagnosa: (code: string) => void

    // Actions — Tindakan (ICD-9)
    addTindakan: (icd: ICD | DiagnosaItem) => void
    removeTindakan: (code: string) => void

    // Actions — Resep
    addResepItem: (item: ResepItem) => void
    removeResepItem: (id: string) => void
    sendResep: () => void

    // Actions — Record
    finalizeRecord: () => boolean // returns false if validation fails
    addAddendum: (catatan: string) => void

    // Actions — Lampiran gambar
    updateLampiranGambar: (dataUrl: string | null) => void

    // Validation
    canFinalize: () => { ok: boolean; errors: string[] }

    // Allergy check
    checkAllergy: (drugName: string) => string | null
}

const DEFAULT_SOAP: SOAPData = {
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    instruksi: "",
}

const DEFAULT_TTV: TTVData = {
    sistole: null,
    diastole: null,
    nadi: null,
    rr: null,
    suhu: null,
    spo2: null,
    berat_badan: null,
    tinggi_badan: null,
}

export const useRekamMedisStore = create<RekamMedisState>((set, get) => ({
    patient: {
        id: undefined,
        nama: "",
        umur: "",
        jenis_kelamin: "",
        no_rm: "",
        allergies: [],
    },

    recordStatus: "Draft",
    resepStatus: "Draft",

    soap: DEFAULT_SOAP,
    ttv: DEFAULT_TTV,
    diagnosaList: [],
    tindakanList: [],
    resepList: [],
    addendums: [],
    lampiranGambar: null,

    hydrateFromApi: (record) =>
        set({
            patient: record.patient,
            recordStatus: record.status,
            resepStatus: record.resep_status,
            soap: record.soap,
            ttv: record.ttv,
            diagnosaList: (record.diagnosa ?? []).filter((d) => (d.type ?? "ICD-10") === "ICD-10"),
            tindakanList: (record.diagnosa ?? []).filter((d) => d.type === "ICD-9"),
            resepList: record.resep,
            addendums: record.addendums,
            lampiranGambar: null,
        }),

    resetStore: () =>
        set({
            patient: {
                id: undefined,
                nama: "",
                umur: "",
                jenis_kelamin: "",
                no_rm: "",
                allergies: [],
            },
            recordStatus: "Draft",
            resepStatus: "Draft",
            soap: DEFAULT_SOAP,
            ttv: DEFAULT_TTV,
            diagnosaList: [],
            tindakanList: [],
            resepList: [],
            addendums: [],
            lampiranGambar: null,
        }),

    // ---- SOAP ----
    updateSOAP: (data) =>
        set((state) => ({ soap: { ...state.soap, ...data } })),

    // ---- TTV ----
    updateTTV: (data) =>
        set((state) => ({ ttv: { ...state.ttv, ...data } })),

    // ---- Diagnosa ----
    addDiagnosa: (icd) =>
        set((state) => {
            if (state.diagnosaList.find((d) => d.code === icd.code)) return state
            return { diagnosaList: [...state.diagnosaList, { ...icd, type: "ICD-10" as const }] }
        }),

    removeDiagnosa: (code) =>
        set((state) => ({
            diagnosaList: state.diagnosaList.filter((d) => d.code !== code),
        })),

    addTindakan: (icd) =>
        set((state) => {
            if (state.tindakanList.find((t) => t.code === icd.code)) return state
            return { tindakanList: [...state.tindakanList, { ...icd, type: "ICD-9" as const }] }
        }),

    removeTindakan: (code) =>
        set((state) => ({
            tindakanList: state.tindakanList.filter((t) => t.code !== code),
        })),

    // ---- Resep ----
    addResepItem: (item) =>
        set((state) => ({ resepList: [...state.resepList, item] })),

    removeResepItem: (id) =>
        set((state) => ({
            resepList: state.resepList.filter((i) => i.id !== id),
        })),

    sendResep: () => set({ resepStatus: "Sent" }),

    // ---- Finalization ----
    canFinalize: () => {
        const state = get()
        const errors: string[] = []

        if (state.diagnosaList.length === 0) {
            errors.push("Minimal satu diagnosa harus dipilih")
        }
        if (!state.soap.assessment.trim()) {
            errors.push("SOAP Assessment (A) harus diisi")
        }
        if (!state.soap.subjective.trim()) {
            errors.push("SOAP Subjective (S) harus diisi")
        }

        return { ok: errors.length === 0, errors }
    },

    finalizeRecord: () => {
        const { ok } = get().canFinalize()
        if (!ok) return false
        set({ recordStatus: "Final" })
        return true
    },

    // ---- Lampiran gambar ----
    updateLampiranGambar: (dataUrl) => set({ lampiranGambar: dataUrl }),

    // ---- Addendum ----
    addAddendum: (catatan) =>
        set((state) => ({
            addendums: [...state.addendums, {
                id: Math.random().toString(36).slice(2),
                catatan,
                timestamp: new Date().toISOString(),
                dokter: "Dokter",
            }],
        })),

    // ---- Allergy check ----
    checkAllergy: (drugName) => {
        const { patient } = get()
        const match = patient.allergies.find((a) =>
            drugName.toLowerCase().includes(a.toLowerCase())
        )
        return match ? `Pasien ALERGI terhadap ${match}!` : null
    },
}))
