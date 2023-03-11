'use client'

import { useEffect, useRef, useState } from 'react'
import { SubmitHandler } from 'react-hook-form'
import { format } from 'date-fns'
import { Loading } from './Loading'
import { Message, MessageProps } from './Message'
import { Conversation } from './Conversation'
import { ErrorMessage } from './ErrorMessage'
import { QuestionForm, QuestionFormSchema } from './QuestionForm'

export type MessageType = Pick<MessageProps, 'ariaLabel'> & {
    role: string
    content: string
}

export const ChatBot = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)

    const [messages, setMessages] = useState<MessageType[]>([
        {
            role: 'assistant',
            ariaLabel: `KezBot said:`,
            content:
                "Hello! I'm KezBot, your go-to source for information about Keziah Rackley-Gale. Ask me anything you want to know about her background, accomplishments, or current work.",
        },
    ])
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

        try {
            const timeOfUserQuestion = format(new Date(), 'k:mm:ss aaaa')

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    role: 'user',
                    ariaLabel: `At ${timeOfUserQuestion} you said:`,
                    content: values.question,
                },
            ])

            setIsLoading(true)

            const response = await fetch('/api/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: values.question.replace(/\n/g, ' '), // OpenAI recommends replacing newlines with spaces for best results,
                    messages: [
                        ...messages,
                        {
                            role: 'user',
                            ariaLabel: `At ${timeOfUserQuestion} you said:`,
                            content: values.question,
                        },
                    ],
                }),
            })

            if (!response.ok) {
                throw new Error(`${response.status}:${response.statusText}`)
            }

            const data = response.body
            if (!data) return

            const reader = data.getReader()
            const textDecoder = new TextDecoder()

            let answer = ''
            const timeOfAssistantAnswer = format(new Date(), 'k:mm:ss aaaa')

            setIsLoading(false)

            let isFirstChunk = true
            let done = false

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                if (done) return

                const chunkValue = textDecoder.decode(value)
                answer += chunkValue

                if (isFirstChunk) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            role: 'assistant',
                            ariaLabel: `At ${timeOfAssistantAnswer} KezBot said:`,
                            content: answer,
                        },
                    ])
                } else {
                    setMessages((prevMessages) => [
                        ...prevMessages.slice(0, -1),
                        {
                            role: 'assistant',
                            ariaLabel: `At ${timeOfAssistantAnswer} KezBot said:`,
                            content: answer,
                        },
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
