export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json }
    | Json[]

export interface Database {
    public: {
        Tables: {
            documents: {
                Row: {
                    document_content: string | null
                    document_embedding: unknown | null
                    document_id: number
                }
                Insert: {
                    document_content?: string | null
                    document_embedding?: unknown | null
                    document_id?: number
                }
                Update: {
                    document_content?: string | null
                    document_embedding?: unknown | null
                    document_id?: number
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            match_documents: {
                Args: {
                    query_embedding: unknown
                    similarity_threshold: number
                    match_count: number
                }
                Returns: {
                    id: number
                    content: string
                    similarity: number
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
