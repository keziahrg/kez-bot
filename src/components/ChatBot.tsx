'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Conversation } from './Conversation'
import { Input } from './Input'
import { Message } from './Message'
import { Loading } from './Loading'
import { format } from 'date-fns'

type Message = {
    text: string
    ariaLabel: string
}

export const ChatBot = () => {
    const formRef = useRef<HTMLFormElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [messages, setMessages] = useState<Message[]>([])

    const handleFormSubmission = async (e: FormEvent) => {
        e.preventDefault()
        const question = inputRef.current?.value ?? ''
        const questionTime = format(new Date(), 'k:mm:ss aaaa')

        setMessages((prevMessages) => [
            ...prevMessages,
            {
                text: `<p>${question}</p>`,
                ariaLabel: `At ${questionTime} you said:`,
            },
        ])

        setIsLoading(true)

        formRef.current?.reset()

        const response = await fetch('/api/completion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        })

        if (!response.ok) {
            throw new Error(response.statusText)
        }

        const data = response.body
        if (!data) return

        const reader = data.getReader()
        const textDecoder = new TextDecoder()

        let answer = ''
        const answerTime = format(new Date(), 'k:mm:ss aaaa')

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
                        text: answer,
                        ariaLabel: `At ${answerTime} KezBot said:`,
                    },
                ])
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages.slice(0, -1),
                    {
                        text: answer,
                        ariaLabel: `At ${answerTime} KezBot said:`,
                    },
                ])
            }

            isFirstChunk = false
        }
    }

    useEffect(() => {
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }

        scrollToBottom()
    }, [messages])

    return (
        <>
            <Conversation>
                <Message
                    className="rounded-bl-none bg-purple"
                    ariaLabel="KezBot said:"
                    message="
                <p>
                    Hello! I'm KezBot, your go-to source for information
                    about Keziah Rackley-Gale. Ask me anything you want to
                    know about her background, accomplishments, or current
                    work.
                </p>
                <br />
                <p>
                    Powered by OpenAI, Supabase, Next.js, and Tailwind CSS,
                    I'm here to provide accurate and helpful information.
                </p>"
                />
                {messages.map((message, i) => (
                    <Message
                        key={i}
                        className={
                            i % 2 !== 0
                                ? 'rounded-bl-none bg-purple'
                                : 'rounded-br-none bg-blue'
                        }
                        ariaLabel={message.ariaLabel}
                        message={message.text}
                    />
                ))}
                <div ref={messagesEndRef} />
                {isLoading ? <Loading /> : null}
            </Conversation>
            <div className="sticky bottom-0 right-0 left-0 bg-white bg-opacity-60 pt-4 pb-8 backdrop-blur-md dark:bg-black dark:bg-opacity-60 dark:text-white md:pt-8 md:pb-16">
                <form
                    ref={formRef}
                    onSubmit={handleFormSubmission}
                    className="relative mx-auto flex max-w-xl px-4"
                >
                    <Input
                        ref={inputRef}
                        label="Enter your question"
                        placeholder="Enter your question"
                        type="text"
                        id="question"
                        name="question"
                        disabled={isLoading}
                    />
                    <button
                        disabled={isLoading}
                        aria-label="Submit question"
                        type="submit"
                        className="background absolute right-8 top-0 bottom-0"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                            width="1em"
                            height="1em"
                            fontSize="1.25rem"
                        >
                            <g
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                clipPath="url(#sendSvgClipPath)"
                            >
                                <path d="m18.33 1.67-9.16 9.16M18.33 1.67 12.5 18.33l-3.33-7.5-7.5-3.33 16.66-5.83Z" />
                            </g>
                            <defs>
                                <clipPath id="sendSvgClipPath">
                                    <path fill="none" d="M0 0h20v20H0z" />
                                </clipPath>
                            </defs>
                        </svg>
                    </button>
                </form>
            </div>
        </>
    )
}
