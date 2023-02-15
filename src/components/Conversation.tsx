import { ReactNode } from 'react'

interface ConversationProps {
    children: ReactNode | ReactNode[]
}

export const Conversation = ({ children }: ConversationProps) => (
    <section
        id="conversation"
        aria-live="polite"
        tabIndex={0}
        aria-label="Chatbot conversation"
        className="mx-auto flex h-full w-full max-w-xl flex-col gap-4 px-4 py-8 "
    >
        {children}
    </section>
)
