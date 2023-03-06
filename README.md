# KezBot — A Personalized GPT-3.5 Chatbot 🤖

KezBot is a custom-built chatbot powered by OpenAI's GPT-3.5 model. It's designed to answer any question you have about me in seconds.

## Technologies Used

KezBot is built with the following technologies:

-   [OpenAI](https://openai.com/) - KezBot's AI engine, which powers its natural language processing capabilities.
-   [Supabase](https://supabase.com/) - KezBot's database provider, which stores embeddings used to provide KezBot context.
-   [Next.js](https://beta.nextjs.org/) - KezBot's frontend framework, using the new Next 13 app router that provides features such as React server components, streaming, new data fetching, and more.
-   [Tailwind CSS](https://tailwindcss.com/) - KezBot's CSS framework, which provides a customised set of styling utilities.

## Installation

To run KezBot locally, you'll need to follow these steps:

1. Clone the KezBot repository from GitHub.
2. Install the dependencies by running `npm install`.
3. Create a `.env.local` file and add your Supabase API key, Supabase project ID, and OpenAI API key.
4. Start the development server by running `npm run dev`.
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

To use KezBot, simply visit the [website](https://kez-bot.vercel.app/) and start asking questions about me!

## References

[This blog post by Vercel](https://vercel.com/blog/gpt-3-app-next-js-vercel-edge-functions) and [this blog post by Supabase](https://supabase.com/blog/openai-embeddings-postgres-vector) provided awesome references.
