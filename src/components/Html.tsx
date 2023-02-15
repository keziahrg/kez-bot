'use client'

import { ThemeContext } from '@/context/ThemeContext'
import { ReactNode, useContext } from 'react'

interface HtmlProps {
    children: ReactNode | ReactNode[]
}

export const Html = ({ children }: HtmlProps) => {
    const { themeColourScheme } = useContext(ThemeContext)

    return (
        <html lang="en" className={`${themeColourScheme} flex h-full flex-col`}>
            {children}
        </html>
    )
}
