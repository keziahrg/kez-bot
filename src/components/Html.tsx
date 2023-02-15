'use client'

import { useThemeContext } from '@/context/ThemeContext'
import { ReactNode } from 'react'

interface HtmlProps {
    children: ReactNode | ReactNode[]
}

export const Html = ({ children }: HtmlProps) => {
    const theme = useThemeContext()

    return (
        <html lang="en" className={`${theme} flex h-full flex-col`}>
            {children}
        </html>
    )
}
