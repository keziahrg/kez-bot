'use client'

import { useTheme } from '@/hooks/useTheme'
import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
} from 'react'

export enum ThemeColourScheme {
    LIGHT = 'light',
    DARK = 'dark',
}

const ThemeContext = createContext<ThemeColourScheme>(ThemeColourScheme.LIGHT)
const SetThemeContext = createContext<
    Dispatch<SetStateAction<ThemeColourScheme>>
>(() => {})

export function useThemeContext() {
    return useContext(ThemeContext)
}

export function useSetThemeContext() {
    return useContext(SetThemeContext)
}

interface ThemeContextProviderProps {
    children: ReactNode | ReactNode[]
}

export function ThemeContextProvider({ children }: ThemeContextProviderProps) {
    const [theme, setTheme] = useTheme()
    return (
        <ThemeContext.Provider value={theme}>
            <SetThemeContext.Provider value={setTheme}>
                {children}
            </SetThemeContext.Provider>
        </ThemeContext.Provider>
    )
}
