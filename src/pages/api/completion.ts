import { supabaseClient } from '@/lib/supabase'
import OneLine from 'oneline'
import stripIndent from 'strip-indent'
import { openAiStream } from '../../helpers'
import GPT3Tokenizer from 'gpt3-tokenizer'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export const config = {
    runtime: 'edge',
}

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ''

export const completionSchema = z
    .object({
        question: z.string().min(1, 'Please enter a question to continue.'),
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

    const { question } = response.data

    // OpenAI recommends replacing newlines with spaces for best results
    const formattedQuestion = question.replace(/\n/g, ' ')

    // Generate a one-time embedding for the query itself
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
        match_count: 3,
    })

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
             to help people! Given the following information about Keziah Rackley-Gale, answer the question using only that information. If you are unsure and the answer
             is not explicitly written in the information, say
             "Sorry, I haven't been taught the answer to that question :("`}

             Context information:
             ${contextInformation}

             Question: """
             ${question}
             """

             Answer:
           `)

    const payload = {
        model: 'text-davinci-003',
        prompt,
        max_tokens: 512,
        temperature: 0,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
        n: 1,
    }

    const stream = await openAiStream(payload)

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' },
    })
}

export default handler
