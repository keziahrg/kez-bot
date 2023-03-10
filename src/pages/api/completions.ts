import { MESSAGE_ROLES } from '@/components/Message'
import { generateEmbedding } from '@/helpers/generateEmbedding'
import { getDocumentsRelatedToEmbedding } from '@/helpers/getDocumentsRelatedToEmbedding'
import { getTokenLength } from '@/helpers/getMessageTokenLength'
import { handleInvalidContentType } from '@/helpers/handleInvalidContentType'
import { handleInvalidMethod } from '@/helpers/handleInvalidMethod'
import { handleInvalidPayload } from '@/helpers/handleInvalidPayload'
import {
    streamCompletionsReponse,
    StreamCompletionsResponsePayload,
} from '@/helpers/streamCompletionsReponse'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export const config = {
    runtime: 'edge',
}

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
        return handleInvalidMethod(req.method)
    }

    if (req.headers.get('Content-Type') !== 'application/json') {
        return handleInvalidContentType()
    }

    const reqBody = await req.json()
    const parsedReqBody = completionsSchema.safeParse(reqBody)
    if (!parsedReqBody.success) {
        return handleInvalidPayload()
    }

    const embedding = await generateEmbedding(parsedReqBody.data.question)
    const relatedDocuments = await getDocumentsRelatedToEmbedding(embedding)

    let context = ''
    let contextTokenLength = 0

    if (relatedDocuments) {
        for (let i = 0; i < relatedDocuments.length; i++) {
            const relatedDocument = relatedDocuments[i]
            contextTokenLength += getTokenLength(relatedDocument.content)

            if (contextTokenLength > 1500) {
                break
            }

            context += relatedDocument.content.trim()
        }
    }

    const systemMessage = {
        role: MESSAGE_ROLES.SYSTEM,
        content: `You are a very enthusiastic chatbot named KezBot who loves to help people! Your job is to answer questions about Keziah Rackley-Gale. Answer the questions as truthfully as possible using the provided context, and if the answer is not explicitly contained within the text below, respond "Sorry, I haven't been taught the answer to that question :("/n---/nContext:/n${context}`,
    }
    const systemMessageTokenLength = getTokenLength(systemMessage.content)

    const [assistantMessage, ...conversation] = parsedReqBody.data.messages
    const assistantMessageTokenLength = getTokenLength(assistantMessage.content)

    const maxRequestTokenLength = 4096

    const maxMessagesTokenLength =
        maxRequestTokenLength -
        systemMessageTokenLength -
        contextTokenLength -
        assistantMessageTokenLength

    let messagesTokenLength = 0
    let noOfOldMessagesToRemove = 0

    const removeOldestMessage = (oldestMessageTokenLength: number | null) => {
        if (
            messagesTokenLength < maxMessagesTokenLength ||
            !oldestMessageTokenLength
        )
            return

        noOfOldMessagesToRemove++
        messagesTokenLength -= oldestMessageTokenLength

        const newOldestMessage = conversation?.[noOfOldMessagesToRemove]
        const newOldestMessageTokenLength = newOldestMessage
            ? getTokenLength(newOldestMessage.content)
            : null

        removeOldestMessage(newOldestMessageTokenLength)
    }

    for (let i = 0; i < conversation.length; i++) {
        const message = conversation[i]

        const mesasageTokenLength = getTokenLength(message.content)
        messagesTokenLength += mesasageTokenLength

        if (messagesTokenLength > maxMessagesTokenLength) {
            removeOldestMessage(
                getTokenLength(conversation[noOfOldMessagesToRemove].content)
            )
        }
    }

    const mostRecentMessages = conversation.slice(
        noOfOldMessagesToRemove,
        conversation.length
    )

    const payload: StreamCompletionsResponsePayload = {
        model: 'gpt-3.5-turbo',
        messages: [systemMessage, assistantMessage, ...mostRecentMessages],
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
