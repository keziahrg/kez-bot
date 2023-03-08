import { ReactNode } from 'react'

export interface MessageProps {
    children: ReactNode
    className?: string
    ariaLabel?: string
}

export const Message = ({
    children,
    className = '',
    ariaLabel,
}: MessageProps) => (
    <section
        className={`rounded-3xl p-4 text-black ${className}`}
        aria-label={ariaLabel}
    >
        <p>{children}</p>
    </section>
)
