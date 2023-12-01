// Tell TypeScript and the package to use the global web fetch instead of node-fetch.
// Note, despite the name, this does not add any polyfills, but expects them to be provided if needed.
import "openai/shims/web";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createParser, EventSourceParser } from "eventsource-parser";
import { chatCompletionsSchema } from "@/components/QuestionForm";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY ?? "",
  dangerouslyAllowBrowser: true,
});

export async function POST(req: Request) {
  if (req.headers.get("Content-Type") !== "application/json") {
    return new Response(null, {
      status: 406,
      statusText: "Invalid Content-Type Header",
    });
  }

  try {
    const reqBody = await req.json();

    const parsedReqBody = chatCompletionsSchema.safeParse(reqBody);
    if (!parsedReqBody.success) {
      return new Response(null, {
        status: 400,
        statusText: "Invalid Payload",
      });
    }

    const response = await openai.chat.completions
      .create({
        model: "gpt-3.5-turbo",
        messages: [
          // {
          //   role: MESSAGE_ROLES.SYSTEM,
          //   content: `You are a helpful chatbot named KezBot. Your job is to answer questions about a woman named Keziah Rackley-Gale. You will be provided with a document about Keziah (delimited by triple quotes) and a question. Your task is to answer the question using only the provided document. If the document does not contain the information needed to answer the question then simply write: "Sorry, I haven't been taught the answer to that question :("./n"""/n${context}/n"""/n`,
          // },
          ...reqBody.messages,
        ],
        stream: true,
        max_tokens: 512,
        temperature: 0.2,
        frequency_penalty: 0,
        presence_penalty: 0,
        n: 1,
      })
      .asResponse();

    if (!response.ok) {
      if (response.body) {
        const reader = response.body.getReader();
        return new ReadableStream({
          async start(controller) {
            const { done, value } = await reader.read();
            if (!done) {
              const errorText = new TextDecoder().decode(value);
              controller.error(new Error(`Response error: ${errorText}`));
            }
          },
        });
      } else {
        return new ReadableStream({
          start(controller) {
            controller.error(new Error("Response error: No response body"));
          },
        });
      }
    }

    const responseBodyStream = response.body || createEmptyReadableStream();

    const stream = responseBodyStream.pipeThrough(
      createEventStreamTransformer()
    );

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      throw error;
    }
  }
}

const createEmptyReadableStream = () => {
  return new ReadableStream({
    start(controller) {
      controller.close();
    },
  });
};

const createEventStreamTransformer = () => {
  let eventSourceParser: EventSourceParser;

  return new TransformStream({
    async start(controller) {
      eventSourceParser = createParser((event) => {
        if (
          "data" in event &&
          event.type === "event" &&
          event.data === "[DONE]"
        ) {
          controller.terminate();
          return;
        }

        if ("data" in event) {
          const parsedData = JSON.parse(event.data);
          const message = parsedData?.choices?.[0]?.delta?.content;
          if (message) {
            controller.enqueue(message);
          }
        }
      });
    },
    transform(chunk) {
      eventSourceParser.feed(new TextDecoder().decode(chunk));
    },
  });
};