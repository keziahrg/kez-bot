import prisma from "@/lib/prisma";
import { Document } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { encodingForModel } from "js-tiktoken";
import { GPT_MODEL } from "./constants";
import { MessageProps } from "@/components/Message";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getContextDocumentsByEmbedding = async (embedding: number[]) => {
  const vectorQuery = `[${embedding.join(",")}]`;

  const documents = await prisma.$queryRaw`
  SELECT
    id,
    "content",
    1 - (embedding <=> ${vectorQuery}::vector) as similarity
  FROM documents
  where 1 - (embedding <=> ${vectorQuery}::vector) > .5
  ORDER BY  similarity DESC
  LIMIT 5;
`;

  return documents as Array<Document & { similarity: number }>;
};

const tokenizer = encodingForModel(GPT_MODEL.NAME);

export const getTokenCount = (string: string) => {
  return tokenizer.encode(string).length;
};

export const removeOldMessagesFromConversation = (
  conversation: MessageProps[]
) => {
  let conversationTokenCount = getTokenCount(JSON.stringify(conversation));

  let newConversation = [...conversation];

  // Start the loop from the users first message since the first 2 messages of
  // the conversation are the system / initial assistant messages, which we want to keep
  for (let i = 2; i < conversation.length; i++) {
    if (conversationTokenCount <= GPT_MODEL.MAX_TOKEN_COUNT) break;

    const currentMessage = conversation[i];
    const currentMessageTokenCount = getTokenCount(
      JSON.stringify(currentMessage)
    );

    const messageIndexInNewConversation = newConversation.findIndex(
      (message) => message.content === currentMessage.content
    );

    if (messageIndexInNewConversation !== -1) {
      newConversation.splice(messageIndexInNewConversation, 1);
      conversationTokenCount -= currentMessageTokenCount;
    }
  }

  return newConversation;
};
