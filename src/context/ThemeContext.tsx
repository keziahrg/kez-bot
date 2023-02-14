'use client'

import { createContext, ReactNode, useState } from 'react'

export enum ThemeColourScheme {
    LIGHT = 'light',
    DARK = 'dark',
}

export interface ThemeContextValue {
    toggleTheme: () => void
    themeColourScheme: ThemeColourScheme
}

export const ThemeContext = createContext<ThemeContextValue>({
    toggleTheme: () => {},
    themeColourScheme: ThemeColourScheme.LIGHT,
})

interface ThemeContextProviderProps {
    children: ReactNode | ReactNode[]
}

export const ThemeContextProvider = ({
    children,
}: ThemeContextProviderProps) => {
    const [themeColourScheme, setThemeColourScheme] =
        useState<ThemeColourScheme>(ThemeColourScheme.LIGHT)

    const toggleTheme = () => {
        setThemeColourScheme((prevThemeColourScheme) =>
            prevThemeColourScheme === ThemeColourScheme.LIGHT
                ? ThemeColourScheme.DARK
                : ThemeColourScheme.LIGHT
        )
    }

    return (
        <ThemeContext.Provider value={{ toggleTheme, themeColourScheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
