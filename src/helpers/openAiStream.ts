import {
    createParser,
    ParsedEvent,
    ReconnectInterval,
} from 'eventsource-parser'

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ''

export const openAiStream = async (payload: any) => {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    let counter = 0

    const res = await fetch('https://api.openai.com/v1/completions', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        method: 'POST',
        body: JSON.stringify(payload),
    })

    const stream = new ReadableStream({
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
                        const text = json.choices[0].text
                        if (counter < 2 && (text.match(/\n/) || []).length) {
                            return
                        }
                        const queue = encoder.encode(text)
                        controller.enqueue(queue)
                        counter++
                    } catch (e) {
                        controller.error(e)
                    }
                }
            }

            const parser = createParser(onParse)
            for await (const chunk of res.body as any) {
                parser.feed(decoder.decode(chunk))
            }
        },
    })

    return stream
}
