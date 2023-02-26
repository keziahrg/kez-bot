import { openAiStream } from '../../helpers'

export const config = {
    runtime: 'edge',
}

const handler = async (req: Request): Promise<Response> => {
    const { prompt } = await req.json()

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
    return new Response(stream)
}

export default handler
