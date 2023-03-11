const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ''

export const generateEmbedding = async (input: string) => {
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
                input: input,
            }),
        }
    )
    const embeddingResponseJson = await embeddingResponse.json()
    const [{ embedding }] = embeddingResponseJson.data

    return embedding
}
