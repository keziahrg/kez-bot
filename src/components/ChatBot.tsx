'use client'

import { useEffect, useRef, useState } from 'react'
import { SubmitHandler } from 'react-hook-form'
import { Loading } from './Loading'
import { Message, MessageType, MESSAGE_ROLES } from './Message'
import { Conversation } from './Conversation'
import { ErrorMessage } from './ErrorMessage'
import { QuestionForm, QuestionFormSchema } from './QuestionForm'
import { getCurrentTime } from '@/helpers/getCurrentTime'

const iniitalMessagesState = [
    {
        role: MESSAGE_ROLES.ASSISTANT,
        ariaLabel: `KezBot said:`,
        content:
            "Hello! I'm KezBot, your go-to source for information about Keziah Rackley-Gale. Ask me anything you want to know about her background, accomplishments, or current work.",
    },
]

export const ChatBot = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)

    const [messages, setMessages] =
        useState<MessageType[]>(iniitalMessagesState)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }

        scrollToBottom()
    }, [messages])

    const handleFormSubmission: SubmitHandler<QuestionFormSchema> = async (
        values
    ) => {
        setIsError(false)

        const latestMessages = [
            ...messages,
            {
                role: 'user',
                ariaLabel: `At ${getCurrentTime()} you said:`,
                content: values.question,
            },
        ]
        setMessages(latestMessages)

        try {
            setIsLoading(true)

            const response = await fetch('/api/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: values.question.replace(/\n/g, ' '), // OpenAI recommends replacing newlines with spaces for best results,
                    messages: latestMessages,
                }),
            })

            if (!response.ok) {
                throw new Error(`${response.status}:${response.statusText}`)
            }

            const data = response.body
            if (!data) return

            const reader = data.getReader()
            const decoder = new TextDecoder()

            let done = false
            let isFirstChunk = true
            let answer = ''

            setIsLoading(false)

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                if (done) return

                const chunk = decoder.decode(value)
                answer += chunk

                const assistantMessage = {
                    role: MESSAGE_ROLES.ASSISTANT,
                    ariaLabel: `At ${getCurrentTime()} KezBot said:`,
                    content: answer,
                }

                if (isFirstChunk) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        assistantMessage,
                    ])
                } else {
                    setMessages((prevMessages) => [
                        ...prevMessages.slice(0, -1),
                        assistantMessage,
                    ])
                }

                isFirstChunk = false
            }
        } catch (error) {
            setIsLoading(false)
            setIsError(true)
        }
    }

    return (
        <>
            {isError ? <ErrorMessage /> : null}
            <Conversation>
                {messages.map((message, i) => (
                    <Message
                        key={i}
                        className={
                            i % 2 === 0
                                ? 'rounded-bl-none bg-purple'
                                : 'rounded-br-none bg-blue'
                        }
                        ariaLabel={message.ariaLabel}
                    >
                        {message.content}
                    </Message>
                ))}
                <div ref={messagesEndRef}>{isLoading ? <Loading /> : null}</div>
            </Conversation>
            <QuestionForm
                onSubmit={handleFormSubmission}
                isLoading={isLoading}
            />
        </>
    )
}
