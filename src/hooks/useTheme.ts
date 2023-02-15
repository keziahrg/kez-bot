import { ThemeColourScheme } from '@/context/ThemeContext'
import { useLocalStorage } from './useLocalStorage'

export function useTheme() {
    return useLocalStorage<ThemeColourScheme>('theme', ThemeColourScheme.LIGHT)
}
