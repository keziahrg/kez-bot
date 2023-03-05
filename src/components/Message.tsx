import { ReactNode } from 'react'

interface MessageProps {
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
        aria-label={ariaLabel}
        className={`rounded-3xl p-4 text-black ${className}`}
    >
        <p>{children}</p>
    </section>
)
