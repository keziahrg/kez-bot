interface MessageProps {
    message: string
    className?: string
    ariaLabel: string
}

export const Message = ({
    message,
    className = '',
    ariaLabel,
}: MessageProps) => (
    <section aria-label={ariaLabel} className={`rounded-3xl p-4 ${className}`}>
        {message}
    </section>
)
