import GPT3NodeTokenizer from 'gpt3-tokenizer'

const tokenizer = new GPT3NodeTokenizer({ type: 'gpt3' })

export const getTokenLength = (string: string) => {
    return tokenizer.encode(string).text.length
}
