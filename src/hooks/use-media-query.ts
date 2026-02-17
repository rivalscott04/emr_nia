import { useState, useEffect } from "react"

/**
 * Breakpoints align dengan Tailwind: md 768px, lg 1024px.
 * Digunakan untuk sidebar: tablet (md) = collapsed, desktop (lg+) = full.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(() =>
        typeof window !== "undefined" ? window.matchMedia(query).matches : false
    )

    useEffect(() => {
        const m = window.matchMedia(query)
        setMatches(m.matches)
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
        m.addEventListener("change", handler)
        return () => m.removeEventListener("change", handler)
    }, [query])

    return matches
}

export function useSidebarBreakpoints() {
    const isLg = useMediaQuery("(min-width: 1024px)")
    const isMd = useMediaQuery("(min-width: 768px)")
    /** Tablet: 768px–1023px → sidebar icon-only */
    const isTablet = isMd && !isLg
    /** Desktop: 1024px+ → sidebar full */
    const isDesktop = isLg
    /** Mobile: <768px → sidebar dalam drawer */
    const isMobile = !isMd
    return { isMobile, isTablet, isDesktop, isMd, isLg }
}
