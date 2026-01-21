'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

const ThemeProviderContext = createContext<{
    theme: Theme
    setTheme: (theme: Theme) => void
} | undefined>(undefined)

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'vite-ui-theme',
    ...props
}: {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
} & React.ComponentProps<'div'>) {
    // Use state with function initializer to access localStorage only on client
    const [theme, setTheme] = useState<Theme>(() => 'system') // Default initially

    useEffect(() => {
        // Hydrate from storage on mount
        const stored = localStorage.getItem(storageKey) as Theme | null
        if (stored) setTheme(stored)
    }, [storageKey])

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove('light', 'dark')

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
                .matches
                ? 'dark'
                : 'light'

            root.classList.add(systemTheme)
            return
        }

        root.classList.add(theme)
    }, [theme])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider')

    return context
}
