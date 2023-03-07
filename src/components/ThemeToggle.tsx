'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export const ThemeToggle = () => {
    const { resolvedTheme, setTheme } = useTheme()

    const [mounted, setMounted] = useState<boolean>(false)
    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    const oppositeTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    const handleOnClick = () => setTheme(oppositeTheme)

    return (
        <button
            aria-label={`Change theme from ${resolvedTheme} to ${oppositeTheme}`}
            onClick={handleOnClick}
        >
            {resolvedTheme === 'light' ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 22 22"
                    width="1em"
                    height="1em"
                    fontSize="1.375rem"
                >
                    <g
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        clipPath="url(#sunSvgClipPath)"
                    >
                        <path d="M11 15.54a4.55 4.55 0 1 0 0-9.09 4.55 4.55 0 0 0 0 9.1ZM11 1v1.82M11 19.18V21M3.93 3.93l1.3 1.29M16.78 16.78l1.3 1.3M1 11h1.82M19.18 11H21M3.93 18.07l1.3-1.29M16.78 5.22l1.3-1.3" />
                    </g>
                    <defs>
                        <clipPath id="sunSvgClipPath">
                            <path fill="none" d="M0 0h22v22H0z" />
                        </clipPath>
                    </defs>
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 22 22"
                    width="1em"
                    height="1em"
                    fontSize="1.375rem"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19.25 11.72a8.25 8.25 0 1 1-8.97-8.97 6.42 6.42 0 0 0 8.97 8.97Z"
                    />
                </svg>
            )}
        </button>
    )
}
