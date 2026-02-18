export interface TindakanItem {
    id: number
    kode: string
    nama: string
    kategori: string
    tarif: number
    is_active: boolean
    created_at?: string
    updated_at?: string
}

export type TindakanCreatePayload = {
    kode: string
    nama: string
    kategori: string
    tarif: number
    is_active?: boolean
}

export type TindakanUpdatePayload = Partial<{
    kode: string
    nama: string
    kategori: string
    tarif: number
    is_active: boolean
}>

export type TindakanListResponse = {
    data: TindakanItem[]
    total: number
}
