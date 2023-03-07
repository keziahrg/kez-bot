import { ReactNode } from 'react'

interface ConversationProps {
    children: ReactNode
}

export const Conversation = ({ children }: ConversationProps) => (
    <section
        className="relative mx-auto flex h-auto w-full max-w-xl flex-grow flex-col gap-4 overflow-x-hidden overflow-y-scroll px-4 py-8 md:py-16"
        id="conversation"
        aria-live="polite"
        aria-label="Chatbot conversation"
        tabIndex={0}
    >
        {children}
    </section>
)
