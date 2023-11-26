// Tell TypeScript and the package to use the global web fetch instead of node-fetch.
// Note, despite the name, this does not add any polyfills, but expects them to be provided if needed.
import "openai/shims/web";
import OpenAI from "openai";
import { z } from "zod";
import { MESSAGE_ROLES } from "@/lib/constants";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

const chatCompletionMessageSchema = z.object({
  content: z.string().nullable(),
  role: z.enum([
    MESSAGE_ROLES.SYSTEM,
    MESSAGE_ROLES.ASSISTANT,
    MESSAGE_ROLES.USER,
  ]),
});

export type ChatCompletionMessage = z.infer<typeof chatCompletionMessageSchema>;

export const chatCompletionsSchema = z
  .object({
    question: z
      .string({
        required_error: "Please ask a question to proceed",
      })
      .trim()
      .min(1, "Question cannot be empty"),
    messages: chatCompletionMessageSchema
      .array()
      .min(1, "Messages cannot be empty"),
  })
  .strict();

export async function POST(req: Request) {
  if (req.headers.get("Content-Type") !== "application/json") {
    return new Response(null, {
      status: 406,
      statusText: "Invalid Content-Type Header",
    });
  }

  const reqBody = await req.json();

  const parsedReqBody = chatCompletionsSchema.safeParse(reqBody);
  if (!parsedReqBody.success) {
    return new Response(null, {
      status: 400,
      statusText: "Invalid Payload",
    });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: reqBody.messages,
    temperature: 0.2,
    stream: true,
  });

  //   const stream = OpenAIStream(response);

  //   return new StreamingTextResponse(stream);
}
