import { supabaseClient } from '@/lib/supabase'
import {
    streamCompletionReponse,
    StreamCompletionResponsePayload,
} from '../../helpers'
import GPT3Tokenizer from 'gpt3-tokenizer'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export const config = {
    runtime: 'edge',
}

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ''

const chatCompletionSchema = z
    .object({
        question: z.string().min(1, 'Please enter a question to continue.'),
        messages: z
            .object({
                role: z.string(),
                content: z.string(),
            })
            .array(),
    })
    .required()
    .strict()

const handler = async (req: NextRequest): Promise<Response> => {
    if (req.method !== 'POST') {
        return new Response(null, {
            status: 405,
            statusText: `Method ${req.method} Not Allowed`,
        })
    }

    if (req.headers.get('Content-Type') !== 'application/json') {
        return new Response(null, {
            status: 406,
            statusText: 'Invalid Content-Type Header',
        })
    }

    const body = await req.json()
    const response = chatCompletionSchema.safeParse(body)

    if (!response.success) {
        return new Response(null, {
            status: 400,
            statusText: 'Invalid Payload',
        })
    }

    const { question, messages } = response.data

    // OpenAI recommends replacing newlines with spaces for best results
    const formattedQuestion = question.replace(/\n/g, ' ')

    // Generate a one-time embedding for the question itself
    const embeddingResponse = await fetch(
        'https://api.openai.com/v1/embeddings',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'text-embedding-ada-002',
                input: formattedQuestion,
            }),
        }
    )
    const embeddingResponseJson = await embeddingResponse.json()
    const [{ embedding }] = embeddingResponseJson.data

    const { data: documents } = await supabaseClient.rpc('match_documents', {
        query_embedding: embedding,
        similarity_threshold: 0.8,
        match_count: 10,
    })

    const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
    let noOfTokensForContext = 0
    let context = ''

    // Concat matched documents
    if (documents) {
        for (let i = 0; i < documents.length; i++) {
            const document = documents[i]
            const content = document.content
            const encoded = tokenizer.encode(content)
            noOfTokensForContext += encoded.text.length

            // Limit context to max 1500 tokens
            if (noOfTokensForContext > 1500) {
                break
            }

            context += content.trim()
        }
    }

    const systemMessage = `You are a very enthusiastic chatbot named KezBot who loves to help people! Your job is to answer questions about Keziah Rackley-Gale. Answer the questions as truthfully as possible using the provided context, and if the answer is not explicitly contained within the text below, respond "Sorry, I haven't been taught the answer to that question :("/n---/nContext:/n${context}`
    const noOfTokensForSystemMessage =
        tokenizer.encode(systemMessage).text.length

    const iniitalAssistantMessage =
        "Hello! I'm KezBot, your go-to source for information about Keziah Rackley-Gale. Ask me anything you want to know about her background, accomplishments, or current work."
    const noOfTokensForInitialAssistantMessage = tokenizer.encode(
        iniitalAssistantMessage
    ).text.length

    const maxNoOfTokensForRequest = 4096
    const maxNoOfTokensForResponse = 512

    const maxNoOfAllowableTokensForMessages =
        maxNoOfTokensForRequest -
        noOfTokensForSystemMessage -
        noOfTokensForContext -
        noOfTokensForInitialAssistantMessage

    let noOfTokensForMessages = 0
    let noOfOldMessagesThatNeedRemoving = 0

    const removeOldMessages = (noOfTokensForOldestMessage: number | null) => {
        if (
            noOfTokensForMessages < maxNoOfAllowableTokensForMessages ||
            !noOfTokensForOldestMessage
        )
            return

        noOfOldMessagesThatNeedRemoving++
        noOfTokensForMessages -= noOfTokensForOldestMessage

        const newOldestMessage =
            messages?.[noOfOldMessagesThatNeedRemoving].content
        const noOfTokensForNewOldestMessage = newOldestMessage
            ? tokenizer.encode(newOldestMessage).text.length
            : null

        removeOldMessages(noOfTokensForNewOldestMessage)
    }

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        const content = message.content
        const encoded = tokenizer.encode(content)
        const noOfTokensForMessage = encoded.text.length
        noOfTokensForMessages += noOfTokensForMessage

        if (noOfTokensForMessages > maxNoOfAllowableTokensForMessages) {
            removeOldMessages(
                tokenizer.encode(
                    messages[noOfOldMessagesThatNeedRemoving].content
                ).text.length
            )
        }
    }

    const mostRecentMessages = [...messages].slice(
        noOfOldMessagesThatNeedRemoving,
        messages.length
    )

    const payload: StreamCompletionResponsePayload = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: systemMessage },
            {
                role: 'assistant',
                content: iniitalAssistantMessage,
            },
            ...mostRecentMessages,
        ],
        max_tokens: maxNoOfTokensForResponse,
        temperature: 0.2,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stream: true,
        n: 1,
    }

    const stream = await streamCompletionReponse(payload)

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' },
    })
}

export default handler
