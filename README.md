# KezBot — A Personalised GPT-3.5-turbo Chatbot 🤖

KezBot is a custom-built chatbot powered by OpenAI's GPT-3.5-turbo model. It's designed to answer any question you have about me in seconds.

## Technologies Used

KezBot is built with the following technologies:

- [OpenAI](https://openai.com/) - KezBot's AI engine, which powers its natural language processing capabilities.
- [Vercel Postgres](https://vercel.com/storage/postgres) - KezBot's database provider, which stores embeddings used to provide KezBot context.
- [PG Vector](https://github.com/pgvector/pgvector-node) — Empowers KezBot with advanced vector similarity search capabilities on stored embeddings. This enables KezBot to enhance contextual understanding, providing more nuanced and relevant responses in conversations.
- [Next.js](https://beta.nextjs.org/) - KezBot's frontend framework. This project uses the App Router, which enables the use of bleeding edge features such as React Server Components.
- [Tailwind CSS](https://tailwindcss.com/) - KezBot's CSS framework, which provides a customised set of styling utilities.

## Installation

To run KezBot locally, you'll need to follow these steps:

1. Clone the KezBot repository from GitHub.
2. Install the dependencies by running `npm install`.
3. Create a `.env.local` file and add your Vercel Postgres variables,and OpenAI API key.
4. Start the development server by running `npm run dev`.
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

To use KezBot, simply visit the [website](https://kez-bot.vercel.app/) and start asking questions about me!
