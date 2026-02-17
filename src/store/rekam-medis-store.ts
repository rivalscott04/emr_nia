import { create } from "zustand"
import type { ICD } from "../services/icd-service"

// ========================================
// Types
// ========================================

export interface SOAPData {
    subjective: string
    objective: string
    assessment: string
    plan: string
    instruksi: string
}

export interface TTVData {
    sistole: number
    diastole: number
    nadi: number
    rr: number
    suhu: number
    spo2: number
    berat_badan: number
    tinggi_badan: number
}

export interface ResepItem {
    id: string
    nama_obat: string
    jumlah: string
    aturan_pakai: string
}

export interface Addendum {
    id: string
    catatan: string
    timestamp: string
    dokter: string
}

export interface PatientInfo {
    id?: string
    nama: string
    umur: string
    jenis_kelamin: string
    no_rm: string
    allergies: string[]
}

export type RecordStatus = "Draft" | "Final"
export type ResepStatus = "Draft" | "Sent" | "Dispensed"

// ========================================
// Store
// ========================================

interface RekamMedisState {
    // Patient
    patient: PatientInfo

    // Record status
    recordStatus: RecordStatus
    resepStatus: ResepStatus

    // Form data
    soap: SOAPData
    ttv: TTVData
    diagnosaList: ICD[]
    resepList: ResepItem[]

    // Addendum
    addendums: Addendum[]

    // Actions — SOAP
    updateSOAP: (data: Partial<SOAPData>) => void

    // Actions — TTV
    updateTTV: (data: Partial<TTVData>) => void

    // Actions — Diagnosa
    addDiagnosa: (icd: ICD) => void
    removeDiagnosa: (code: string) => void

    // Actions — Resep
    addResepItem: (item: ResepItem) => void
    removeResepItem: (id: string) => void
    sendResep: () => void

    // Actions — Record
    finalizeRecord: () => boolean // returns false if validation fails
    addAddendum: (catatan: string) => void

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
    sistole: 120,
    diastole: 80,
    nadi: 80,
    rr: 20,
    suhu: 36.5,
    spo2: 98,
    berat_badan: 60,
    tinggi_badan: 170,
}

export const useRekamMedisStore = create<RekamMedisState>((set, get) => ({
    // Patient (mock data; id untuk link ke Profil Pasien)
    patient: {
        id: "1",
        nama: "Budi Santoso",
        umur: "35 Tahun",
        jenis_kelamin: "Laki-laki",
        no_rm: "RM-00001",
        allergies: ["Amoxicillin", "Ibuprofen"],
    },

    recordStatus: "Draft",
    resepStatus: "Draft",

    soap: DEFAULT_SOAP,
    ttv: DEFAULT_TTV,
    diagnosaList: [],
    resepList: [],
    addendums: [],

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
            return { diagnosaList: [...state.diagnosaList, icd] }
        }),

    removeDiagnosa: (code) =>
        set((state) => ({
            diagnosaList: state.diagnosaList.filter((d) => d.code !== code),
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

    // ---- Addendum ----
    addAddendum: (catatan) =>
        set((state) => ({
            addendums: [
                ...state.addendums,
                {
                    id: Math.random().toString(36).slice(2),
                    catatan,
                    timestamp: new Date().toISOString(),
                    dokter: "dr. Andi",
                },
            ],
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
