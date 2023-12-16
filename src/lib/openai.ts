import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "",
  dangerouslyAllowBrowser: true,
});

export const generateEmbedding = async (content: string) => {
  // OpenAI recommends replacing newlines with spaces for best results
  const input = content.replace(/\n/g, " ");
  const embeddingData = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });
  const [{ embedding }] = embeddingData.data;
  return embedding;
};
