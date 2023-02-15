'use client'

import { useRef } from 'react'
import { Conversation } from './Conversation'
import { Input } from './Input'
import { Message } from './Message'

export const ChatBot = () => {
    const formRef = useRef<HTMLFormElement>(null)

    const handleFormSubmission = () => {
        console.log('handle submit')
    }

    return (
        <div className="flex h-full flex-col">
            <Conversation>
                <Message
                    className="rounded-bl-none bg-purple"
                    message="Hi!"
                    ariaLabel={`At 2:41pm KezBot said:`}
                />
                <Message
                    className="rounded-br-none bg-blue"
                    message="Hello!"
                    ariaLabel={`At 2:42pm you said:`}
                />
            </Conversation>
            <div className="sticky bottom-0 right-0 left-0 bg-white bg-opacity-60 pt-4 pb-8 backdrop-blur-md dark:bg-black dark:bg-opacity-60 dark:text-white md:pt-8 md:pb-16">
                <form
                    ref={formRef}
                    onSubmit={handleFormSubmission}
                    className="relative mx-auto flex max-w-xl px-4"
                >
                    <Input
                        label="Enter your question"
                        placeholder="Enter your question"
                        type="text"
                        id="question"
                        name="question"
                    />
                    <button
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
        </div>
    )
}
