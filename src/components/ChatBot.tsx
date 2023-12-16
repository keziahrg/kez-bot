"use client";

import { Message, MessageProps } from "./Message";
import { Conversation } from "./Conversation";
import { ErrorMessage } from "./ErrorMessage";
import { QuestionForm, QuestionFormSchema } from "./QuestionForm";
import { ConversationScrollAnchor } from "./ConversationScrollAnchor";
import { CHAT_BOT_STATUS, MESSAGE_ROLES } from "@/lib/constants";
import { useState } from "react";

const initalMessagesState = [
  {
    role: MESSAGE_ROLES.ASSISTANT,
    content:
      "Hey! I'm KezBot, your go-to source for information about Keziah Rackley-Gale. Ask me anything you want to know about her background, accomplishments, or current work.",
  },
];

export type ChatBotStatus =
  (typeof CHAT_BOT_STATUS)[keyof typeof CHAT_BOT_STATUS];

export const ChatBot = () => {
  const [messages, setMessages] = useState<MessageProps[]>(initalMessagesState);
  const [status, setStatus] = useState<ChatBotStatus>(
    CHAT_BOT_STATUS.AWAITING_MESSAGE
  );
  const [error, setError] = useState<unknown | undefined>(undefined);

  const handleSubmitMessage = async (values: QuestionFormSchema) => {
    setStatus(CHAT_BOT_STATUS.GENERATING_MESSAGE);
    setError(undefined);

    const sanitisedQuestion = values.question.trim();

    try {
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: MESSAGE_ROLES.USER,
          content: sanitisedQuestion,
        },
      ]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: sanitisedQuestion,
          messages: [
            ...messages,
            {
              role: MESSAGE_ROLES.USER,
              content: sanitisedQuestion,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`${response.status}:${response.statusText}`);
      }

      if (!response?.body) {
        throw new Error("There was no response!");
      }

      // Set up the reader to decode the text as it gets read
      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();
      let isFirstChunk = true;
      let answer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        answer += value;

        // If we're streaming the first chunk of the response, we want to
        // add a new message to our messages array
        if (isFirstChunk) {
          setMessages((previousMessages) => [
            ...previousMessages,
            {
              role: MESSAGE_ROLES.ASSISTANT,
              content: answer,
            },
          ]);

          isFirstChunk = false;
        } else {
          // If we're streaming a chunk that is NOT the first chunk of the response
          // we want to update only the last message in our array so that we don't
          // add a new message for each chunk of the response
          setMessages((previousMessages) => [
            ...previousMessages.slice(0, -1),
            {
              role: MESSAGE_ROLES.ASSISTANT,
              content: answer,
            },
          ]);
        }
      }
    } catch (err) {
      setError(err);
    }

    setStatus(CHAT_BOT_STATUS.AWAITING_MESSAGE);
  };

  return (
    <>
      <Conversation>
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
        {error ? <ErrorMessage /> : null}
        <ConversationScrollAnchor
          isLoading={status === CHAT_BOT_STATUS.GENERATING_MESSAGE}
        />
      </Conversation>
      <QuestionForm
        isLoading={status === CHAT_BOT_STATUS.GENERATING_MESSAGE}
        submitMessage={handleSubmitMessage}
      />
    </>
  );
};
