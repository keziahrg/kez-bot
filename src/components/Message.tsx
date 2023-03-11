import { ReactNode } from 'react'

interface MessageProps {
    children: ReactNode
    className?: string
    ariaLabel?: string
}

export type MessageType = Pick<MessageProps, 'ariaLabel'> & {
    role: string
    content: string
}

export enum MESSAGE_ROLES {
    SYSTEM = 'system',
    ASSISTANT = 'assistant',
    USER = 'user',
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
