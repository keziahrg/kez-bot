import prisma from "@/lib/prisma";
import { generateEmbedding } from "@/lib/openai";
import documents from "@/data/documents.json";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("process.env.OPENAI_API_KEY is not defined. Please set it.");
}

if (!process.env.POSTGRES_URL) {
  throw new Error("process.env.POSTGRES_URL is not defined. Please set it.");
}

async function main() {
  try {
    const document = await prisma.document.findFirst({
      where: {
        content: "Keziah is a front-end developer",
      },
    });
    if (document) {
      console.log("Database already seeded!");
      return;
    }
  } catch (error) {
    console.error(
      "Error checking if a mock document already exists in the database."
    );
    throw error;
  }
  // Since vercel only allows 1 postgres database per personal plan,
  // we're just going to seed our database with prod data from the get-go
  // instead of having a dev database with test data
  for (const content of documents) {
    // Generate the embedding for the document
    const embedding = await generateEmbedding(content);

    // Create the document in the database
    const document = await prisma.document.create({
      data: { content },
    });

    // Add the embedding
    await prisma.$executeRaw`
        UPDATE documents
        SET embedding = ${embedding}::vector
        WHERE id = ${document.id}
    `;

    console.log(`Added document with id of ${document.id} to the database`);

    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms between requests;
  }

  console.log("Database seeded successfully!");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
