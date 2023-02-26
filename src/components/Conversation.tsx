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
        className="relative mx-auto flex h-auto w-full max-w-xl flex-grow flex-col gap-4 overflow-x-hidden overflow-y-scroll px-4 py-8 md:py-16"
    >
        {children}
    </section>
)
