import { supabaseClient } from '@/lib/supabase/supabaseClient'

export const getDocumentsRelatedToEmbedding = async (embedding: string) => {
    const { data: documents } = await supabaseClient.rpc('match_documents', {
        query_embedding: embedding,
        similarity_threshold: 0.8,
        match_count: 10,
    })

    return documents
}
