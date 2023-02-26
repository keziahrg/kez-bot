'use client'

import { supabaseClient } from '@/lib/supabase'
import OneLine from 'oneline'
import { FormEvent, useEffect, useRef, useState } from 'react'
import stripIndent from 'strip-indent'
import { Conversation } from './Conversation'
import { Input } from './Input'
import { Message } from './Message'
import GPT3Tokenizer from 'gpt3-tokenizer'
import { openaiApi } from '@/lib/openai'
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
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleFormSubmission = async (e: FormEvent) => {
        setIsLoading(true)
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

        formRef.current?.reset()

        // OpenAI recommends replacing newlines with spaces for best results
        const sanitisedQuestion = question.replace(/\n/g, ' ')

        // Generate a one-time embedding for the query itself
        const embeddingResponse = await openaiApi.createEmbedding({
            model: 'text-embedding-ada-002',
            input: sanitisedQuestion,
        })

        const [{ embedding }] = embeddingResponse.data.data

        const { data: documents } = await supabaseClient.rpc(
            'match_documents',
            {
                query_embedding: embedding,
                similarity_threshold: 0.8,
                match_count: 3,
            }
        )

        const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
        let tokenCount = 0
        let contextInformation = ''

        // Concat matched documents
        if (documents) {
            for (let i = 0; i < documents.length; i++) {
                const document = documents[i]
                const content = document.content
                const encoded = tokenizer.encode(content)
                tokenCount += encoded.text.length

                // Limit context to max 1500 tokens (configurable)
                if (tokenCount > 1500) {
                    break
                }

                contextInformation += `${content.trim()}\n---\n`
            }
        }

        const prompt = stripIndent(`
            ${OneLine`You are a very enthusiastic chat bot built to answer questions about Keziah Rackley-Gale. You love
            to help people! Given the following information about Keziah Rackley-Gale, answer the question using only that information,
            outputted in HTML format. If you are unsure and the answer
            is not explicitly written in the information, say
            "Sorry, I haven't been taught the answer to that question :("`}

            Context information:
            ${contextInformation}

            Question: """
            ${question}
            """

            Answer as HTML:
          `)

        const response = await fetch('/api/completion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        })

        if (!response.ok) {
            throw new Error(response.statusText)
        }

        const data = response.body
        if (!data) {
            return
        }
        const reader = data.getReader()
        const decoder = new TextDecoder()
        let done = false
        let answer = ''
        const answerTime = format(new Date(), 'k:mm:ss aaaa')
        while (!done) {
            const { value, done: doneReading } = await reader.read()
            done = doneReading
            const chunkValue = decoder.decode(value)
            answer += chunkValue
        }

        setMessages((prevMessages) => [
            ...prevMessages,
            {
                text: answer,
                ariaLabel: `At ${answerTime} KezBot said:`,
            },
        ])
        setIsLoading(false)
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
                    message="<p>Hello! I'm KezBot, your go-to source for information about Keziah Rackley-Gale. Ask me anything you want to know about her background, accomplishments, or current work.</p><br/><p>Powered by OpenAI, Supabase, Next.js, and Tailwind CSS, I'm here to provide accurate and helpful information.</p>"
                    ariaLabel="KezBot said:"
                />
                {messages.map((message, i) => {
                    return (
                        <Message
                            key={i}
                            className={
                                i % 2 !== 0
                                    ? 'rounded-bl-none bg-purple'
                                    : 'rounded-br-none bg-blue'
                            }
                            message={message.text}
                            ariaLabel={message.ariaLabel}
                        />
                    )
                })}
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
