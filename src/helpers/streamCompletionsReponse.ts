import { handleInvalidPayload } from '@/helpers/handleInvalidPayload'
import {
    createParser,
    ParsedEvent,
    ReconnectInterval,
} from 'eventsource-parser'
import { BufferSource } from 'stream/web'
import { z } from 'zod'

const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ''

const streamCompletionsResponsePayloadSchema = z
    .object({
        model: z.string(),
        messages: z
            .object({
                role: z.string(),
                content: z.string(),
            })
            .array(),
        max_tokens: z.number(),
        temperature: z.number(),
        frequency_penalty: z.number(),
        presence_penalty: z.number(),
        stream: z.boolean(),
        n: z.number(),
    })
    .required()
    .strict()

export type StreamCompletionsResponsePayload = z.infer<
    typeof streamCompletionsResponsePayloadSchema
>

export const streamCompletionsReponse = async (
    payload: StreamCompletionsResponsePayload
) => {
    const parsedPayload =
        streamCompletionsResponsePayloadSchema.safeParse(payload)

    if (!parsedPayload.success) {
        return handleInvalidPayload()
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
        },
        method: 'POST',
        body: JSON.stringify(payload),
    })

    let counter = 0

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const responseStream = new ReadableStream<Uint8Array>({
        async start(controller) {
            function onParse(event: ParsedEvent | ReconnectInterval) {
                if (event.type === 'event') {
                    const data = event.data
                    if (data === '[DONE]') {
                        controller.close()
                        return
                    }

                    try {
                        const json = JSON.parse(data)
                        const text = json.choices[0].delta.content
                        if (counter < 2 && !text) return

                        const queue = encoder.encode(text)
                        controller.enqueue(queue)

                        counter++
                    } catch (e) {
                        controller.error(e)
                    }
                }
            }

            const parser = createParser(onParse)
            for await (const chunk of res.body as unknown as Uint8Array) {
                parser.feed(decoder.decode(chunk as unknown as BufferSource))
            }
        },
    })

    return responseStream
}
