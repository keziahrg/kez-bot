type ConversationProps = {
  children: React.ReactNode;
};

export const Conversation = ({ children }: ConversationProps) => (
  <section
    className="relative mx-auto flex h-auto w-full max-w-xl flex-grow flex-col gap-4 overflow-x-hidden overflow-y-scroll px-4 pt-24 md:pt-28"
    id="conversation"
    aria-live="polite"
    aria-label="Chatbot conversation"
    tabIndex={0}
  >
    {children}
  </section>
);
