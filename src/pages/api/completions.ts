import {
    streamCompletionsReponse,
    StreamCompletionsResponsePayload,
} from '@/helpers/streamCompletionsReponse'
import { supabaseClient } from '@/lib/supabase/supabaseClient'
import GPT3Tokenizer from 'gpt3-tokenizer'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export const config = {
    runtime: 'edge',
}

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ''

export const completionsSchema = z
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

    const reqBody = await req.json()
    const parsedReqBody = completionsSchema.safeParse(reqBody)

    if (!parsedReqBody.success) {
        return new Response(null, {
            status: 400,
            statusText: 'Invalid Payload',
        })
    }

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
                input: parsedReqBody.data.question,
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

    const systemMessage = {
        role: 'system',
        content: `You are a very enthusiastic chatbot named KezBot who loves to help people! Your job is to answer questions about Keziah Rackley-Gale. Answer the questions as truthfully as possible using the provided context, and if the answer is not explicitly contained within the text below, respond "Sorry, I haven't been taught the answer to that question :("/n---/nContext:/n${context}`,
    }
    const noOfTokensForSystemMessage = tokenizer.encode(systemMessage.content)
        .text.length

    const [iniitalAssistantMessage, ...conversation] =
        parsedReqBody.data.messages
    const noOfTokensForInitialAssistantMessage = tokenizer.encode(
        iniitalAssistantMessage.content
    ).text.length

    const maxNoOfTokensForRequest = 4096

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
            conversation?.[noOfOldMessagesThatNeedRemoving].content
        const noOfTokensForNewOldestMessage = newOldestMessage
            ? tokenizer.encode(newOldestMessage).text.length
            : null

        removeOldMessages(noOfTokensForNewOldestMessage)
    }

    for (let i = 0; i < conversation.length; i++) {
        const message = conversation[i]
        const content = message.content
        const encoded = tokenizer.encode(content)
        const noOfTokensForMessage = encoded.text.length
        noOfTokensForMessages += noOfTokensForMessage

        if (noOfTokensForMessages > maxNoOfAllowableTokensForMessages) {
            removeOldMessages(
                tokenizer.encode(
                    conversation[noOfOldMessagesThatNeedRemoving].content
                ).text.length
            )
        }
    }

    const mostRecentMessages = conversation.slice(
        noOfOldMessagesThatNeedRemoving,
        conversation.length
    )

    const payload: StreamCompletionsResponsePayload = {
        model: 'gpt-3.5-turbo',
        messages: [
            systemMessage,
            iniitalAssistantMessage,
            ...mostRecentMessages,
        ],
        max_tokens: 512,
        temperature: 0.2,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stream: true,
        n: 1,
    }

    const streamResponse = await streamCompletionsReponse(payload)

    if ('ok' in streamResponse) {
        return streamResponse
    }

    return new Response(streamResponse, {
        headers: { 'Content-Type': 'text/event-stream' },
    })
}

export default handler
