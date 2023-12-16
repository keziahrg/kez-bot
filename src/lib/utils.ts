import prisma from "@/lib/prisma";
import { Document } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  LIMIT 8;
`;

  return documents as Array<Document & { similarity: number }>;
};
