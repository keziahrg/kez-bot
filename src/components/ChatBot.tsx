'use client'

import { useEffect, useRef, useState } from 'react'
import { Conversation } from './Conversation'
import { Message } from './Message'
import { Loading } from './Loading'
import { format } from 'date-fns'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Error from 'next/error'
import { z } from 'zod'

type Message = {
    content: string
    role: string
    ariaLabel?: string
}

export const formSchema = z
    .object({
        question: z.string().min(1, 'Please enter a question to continue.'),
    })
    .required()
    .strict()

export type FormSchema = z.infer<typeof formSchema>

export const ChatBot = () => {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<Message[]>([])

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
    })

    const handleFormSubmission: SubmitHandler<FormSchema> = async ({
        question,
    }) => {
        setIsError(false)

        try {
            const questionTime = format(new Date(), 'k:mm:ss aaaa')

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    content: question,
                    role: 'user',
                    ariaLabel: `At ${questionTime} you said:`,
                },
            ])

            setIsLoading(true)
            reset()

            const response = await fetch('/api/completion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question,
                    messages: [
                        ...messages,
                        {
                            content: question,
                            role: 'user',
                            ariaLabel: `At ${questionTime} you said:`,
                        },
                    ],
                }),
            })

            if (!response.ok) {
                throw new Error({
                    statusCode: response.status,
                    title: response.statusText,
                })
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
                            content: answer,
                            role: 'assistant',
                            ariaLabel: `At ${answerTime} KezBot said:`,
                        },
                    ])
                } else {
                    setMessages((prevMessages) => [
                        ...prevMessages.slice(0, -1),
                        {
                            content: answer,
                            role: 'assistant',
                            ariaLabel: `At ${answerTime} KezBot said:`,
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

    useEffect(() => {
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }

        scrollToBottom()
    }, [messages])

    return (
        <>
            {isError ? (
                <div className="mx-auto mt-8 flex w-full max-w-xl justify-center px-4 md:mt-16">
                    <div className=" w-full rounded-3xl bg-pink px-4 py-4">
                        <p className="text-black">
                            Woops! There was an error. Please try again later.
                        </p>
                    </div>
                </div>
            ) : null}
            <Conversation>
                <Message
                    className="rounded-bl-none bg-purple"
                    ariaLabel="KezBot said:"
                >
                    {`Hello! I'm KezBot, your go-to source for information
                        about Keziah Rackley-Gale. Ask me anything you want to
                        know about her background, accomplishments, or current
                        work.`}
                </Message>
                {messages.map((message, i) => (
                    <Message
                        key={i}
                        className={
                            i % 2 !== 0
                                ? 'rounded-bl-none bg-purple'
                                : 'rounded-br-none bg-blue'
                        }
                        ariaLabel={message.ariaLabel}
                    >
                        {message.content}
                    </Message>
                ))}
                <div ref={messagesEndRef} />
                {isLoading ? <Loading /> : null}
            </Conversation>
            <div className="sticky bottom-0 right-0 left-0 bg-white bg-opacity-60 pt-4 pb-8 backdrop-blur-md dark:bg-black dark:bg-opacity-60 dark:text-white md:pt-8 md:pb-16">
                <form
                    onSubmit={handleSubmit(handleFormSubmission)}
                    className="relative mx-auto grid max-w-xl px-4"
                >
                    <>
                        <label
                            className="sr-only row-start-1 row-end-2"
                            htmlFor="question"
                        >
                            Enter your question
                        </label>
                        <input
                            aria-required
                            className="row-start-2 row-end-3 w-full appearance-none rounded-3xl border-2 bg-grey-light py-4 pr-12 pl-4 dark:border-white dark:bg-grey-dark"
                            placeholder="Enter your question"
                            type="text"
                            id="question"
                            disabled={isSubmitting}
                            autoComplete="off"
                            {...register('question')}
                        />
                        {errors.question?.message ? (
                            <p className="row-start-3 row-end-4 mt-4 text-xs text-pink">
                                {errors.question.message}
                            </p>
                        ) : null}
                        <button
                            disabled={isLoading}
                            aria-label="Submit question"
                            type="submit"
                            className="background absolute right-8 top-0 bottom-0 row-start-2 row-end-3"
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
                    </>
                </form>
            </div>
        </>
    )
}
