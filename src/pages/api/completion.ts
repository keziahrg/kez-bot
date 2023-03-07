import { supabaseClient } from '@/lib/supabase'
import { openAiStream } from '../../helpers'
import GPT3Tokenizer from 'gpt3-tokenizer'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { OpenAiStreamPayload } from '@/helpers/openAiStream'

export const config = {
    runtime: 'edge',
}

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ''

export const completionSchema = z
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

export type CompletionSchema = z.infer<typeof completionSchema>

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
    const response = completionSchema.safeParse(body)

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
    let tokenCount = 0
    let context = ''

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

            context += content.trim()
        }
    }

    const prompt = `You are a very enthusiastic chatbot named KezBot who loves to help people! Your job is to answer questions about Keziah Rackley-Gale. Answer the questions as truthfully as possible using the provided context, and if the answer is not explicitly contained within the text below, respond "Sorry, I haven't been taught the answer to that question :("/n---/nContext:/n${context}`
    const promptTokens = tokenizer.encode(prompt).text.length
    const initialMessageToken = tokenizer.encode(
        "Hello! I'm KezBot, your go-to source for information about Keziah Rackley-Gale. Ask me anything you want to know about her background, accomplishments, or current work."
    ).text.length
    const maxTokensForResponse = 512
    const maxAllowableTokensForMessages =
        4096 - tokenCount - promptTokens - initialMessageToken

    let messageTokens = 0
    let numberOfMessagesToRemove = 0

    const removeOldMessages = (oldestMessageTokenLenght: number | null) => {
        if (
            messageTokens < maxAllowableTokensForMessages ||
            !oldestMessageTokenLenght
        )
            return

        numberOfMessagesToRemove++
        messageTokens = messageTokens - oldestMessageTokenLenght

        removeOldMessages(
            tokenizer?.encode?.(messages?.[numberOfMessagesToRemove]?.content)
                ?.text?.length ?? null
        )
    }

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i]
        const content = message.content
        const encoded = tokenizer.encode(content)
        const messageLength = encoded.text.length
        messageTokens += messageLength

        if (messageTokens > maxAllowableTokensForMessages) {
            removeOldMessages(
                tokenizer.encode(messages[numberOfMessagesToRemove].content)
                    .text.length
            )
        }
    }

    const actualMessages = [...messages].slice(
        numberOfMessagesToRemove,
        messages.length
    )

    const payload: OpenAiStreamPayload = {
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: prompt },
            {
                role: 'assistant',
                content:
                    "Hello! I'm KezBot, your go-to source for information about Keziah Rackley-Gale. Ask me anything you want to know about her background, accomplishments, or current work.",
            },
            ...actualMessages,
        ],
        max_tokens: maxTokensForResponse,
        temperature: 0.2,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stream: true,
        n: 1,
    }

    const stream = await openAiStream(payload)

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' },
    })
}

export default handler
