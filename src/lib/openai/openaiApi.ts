import { Configuration, OpenAIApi } from 'openai'

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? ''

const configuration = new Configuration({ apiKey })
export const openaiApi = new OpenAIApi(configuration)
