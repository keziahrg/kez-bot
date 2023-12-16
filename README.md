# KezBot — A Personalised GPT-3.5-turbo Chatbot 🤖

KezBot is a custom-built chatbot powered by OpenAI's GPT-3.5-turbo model. It's designed to answer any question you have about me in seconds.

## Technologies Used

KezBot is built with the following technologies:

KezBot is crafted with the following technologies:

- [OpenAI](https://openai.com/) — The AI engine empowering KezBot's natural language processing capabilities.
- [Vercel Postgres](https://vercel.com/storage/postgres) — KezBot's database provider, storing embeddings for contextual understanding.
- [PG Vector](https://github.com/pgvector/pgvector-node) — Provides advanced vector similarity search capabilities, enhancing KezBot's contextual responses.
- [Prisma](https://www.prisma.io/) — Database access and management tool.
- [Next.js](https://beta.nextjs.org/) — KezBot's frontend framework using React Server Components for bleeding-edge features.
- [Tailwind CSS](https://tailwindcss.com/) — CSS framework providing a customized set of styling utilities.

## Installation

To run KezBot locally, you'll need to follow these steps:

1. Clone the KezBot repository from GitHub.
2. Install the dependencies by running `npm install`.
3. Create a `.env.local` file and add your Vercel Postgres variables,and OpenAI API key.
4. Add some made-up facts about me to the JSON file at `src/data/documents.json`.
5. Sign up/log in to your Prisma account, set up [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate), and set your DATABASE_URL environment variable to your Prisma Accelerate URL.
6. Run `npm run prisma:seed` to seed your database.
7. Start the development server by running `npm run dev`.
8. Open [http://localhost:3000](http://localhost:3000) in your browser.
9. Start asking questions.

## Usage

To use KezBot, simply visit the [website](https://kez-bot.vercel.app/) and start asking questions about me!
