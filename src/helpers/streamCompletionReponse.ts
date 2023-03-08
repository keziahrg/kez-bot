import { MessageType } from '@/components/ChatBot'
import {
    createParser,
    ParsedEvent,
    ReconnectInterval,
} from 'eventsource-parser'
import { BufferSource } from 'stream/web'

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ''

export interface StreamCompletionResponsePayload {
    model: string
    messages: MessageType[]
    max_tokens: number
    temperature: number
    frequency_penalty: number
    presence_penalty: number
    stream: boolean
    n: number
}

export const streamCompletionReponse = async (
    payload: StreamCompletionResponsePayload
) => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        method: 'POST',
        body: JSON.stringify(payload),
    })

    let counter = 0

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream<Uint8Array>({
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

    return stream
}
