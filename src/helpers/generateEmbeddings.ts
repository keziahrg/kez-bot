import { supabaseClient } from '@/lib/supabase'
import { openaiApi } from '@/lib/openai'

export const generateEmbeddings = async (): Promise<void> => {
    const documents = ['']

    // Assuming each document is a string
    for (const document of documents) {
        // OpenAI recommends replacing newlines with spaces for best results
        const input = document.replace(/\n/g, ' ')

        const embeddingResponse = await openaiApi.createEmbedding({
            model: 'text-embedding-ada-002',
            input,
        })

        const [{ embedding }] = embeddingResponse.data.data

        // In production we should handle possible errors
        await supabaseClient.from('documents').insert({
            document_content: document,
            document_embedding: embedding,
        })
    }
}
