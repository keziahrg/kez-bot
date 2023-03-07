import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const apiKey = process.env.SUPABASE_API_KEY ?? ''
const projectId = process.env.SUPABASE_PROJECT_ID ?? ''
const projectUrl = `https://${projectId}.supabase.co`

export const supabaseClient = createClient<Database>(projectUrl, apiKey)
