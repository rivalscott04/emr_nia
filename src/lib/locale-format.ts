/** Locale / currency used across the app for IDR display. */
export const APP_LOCALE = "id-ID" as const
export const APP_CURRENCY = "IDR" as const

export function formatIdr(amount: number): string {
    return new Intl.NumberFormat(APP_LOCALE, {
        style: "currency",
        currency: APP_CURRENCY,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/** Integer with Indonesian grouping (counts, stock, qty) — not currency. */
export function formatIdInteger(value: number): string {
    return new Intl.NumberFormat(APP_LOCALE, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}
