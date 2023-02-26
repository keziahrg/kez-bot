import { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

const apiKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY ?? ''
const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID ?? ''
const projectUrl = `https://${projectId}.supabase.co`

export const supabaseClient = createClient<Database>(projectUrl, apiKey)
