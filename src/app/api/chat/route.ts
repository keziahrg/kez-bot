// Tell TypeScript and the package to use the global web fetch instead of node-fetch.
// Note, despite the name, this does not add any polyfills, but expects them to be provided if needed.
import "openai/shims/web";
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createParser, EventSourceParser } from "eventsource-parser";
import { openai, generateEmbedding } from "@/lib/openai";
import { GPT_MODEL, MESSAGE_ROLES } from "@/lib/constants";
import {
  getContextDocumentsByEmbedding,
  removeOldMessagesFromConversation,
} from "@/lib/utils";

export const runtime = "edge";

export async function POST(req: Request) {
  if (req.headers.get("Content-Type") !== "application/json") {
    return new Response(null, {
      status: 406,
      statusText: "Invalid Content-Type Header",
    });
  }

  try {
    const reqBody = await req.json();

    const embedding = await generateEmbedding(reqBody.question);
    const contextDocuments = await getContextDocumentsByEmbedding(embedding);

    let context = "";

    for (const contextDocument of contextDocuments) {
      context += contextDocument?.content?.trim() ?? "";
    }

    const conversation = [
      {
        role: MESSAGE_ROLES.SYSTEM,
        content: `You are a helpful chatbot named KezBot. Your job is to answer questions about a woman named Keziah Rackley-Gale. You will be provided with a document about Keziah (delimited by triple quotes) and a question. Your task is to answer the question using only the provided document. If the document does not contain the information needed to answer the question then simply write: "Sorry, I haven't been taught the answer to that question :("./n"""/n${context}/n"""/n`,
      },
      ...reqBody.messages,
    ];

    const messages = removeOldMessagesFromConversation(conversation);

    const response = await openai.chat.completions
      .create({
        model: GPT_MODEL.NAME,
        messages,
        stream: true,
        max_tokens: GPT_MODEL.MAX_TOKEN_COUNT,
        temperature: 0,
        frequency_penalty: -2,
        presence_penalty: 0,
        n: 1,
        stop: [],
      })
      .asResponse();

    if (!response.ok) {
      if (response.body) {
        const reader = response.body.getReader();
        const stream = new ReadableStream({
          async start(controller) {
            const { done, value } = await reader.read();
            if (!done) {
              const errorText = new TextDecoder().decode(value);
              controller.error(new Error(`Response error: ${errorText}`));
            }
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/event-stream" },
        });
      } else {
        const stream = new ReadableStream({
          start(controller) {
            controller.error(new Error("Response error: No response body"));
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/event-stream" },
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
            controller.enqueue(new TextEncoder().encode(message));
          }
        }
      });
    },
    transform(chunk) {
      eventSourceParser.feed(new TextDecoder().decode(chunk));
    },
  });
};
