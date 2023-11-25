"use client";

import { useState } from "react";
import { Message, MessageProps } from "./Message";
import { Conversation } from "./Conversation";
import { ErrorMessage } from "./ErrorMessage";
import { QuestionForm } from "./QuestionForm";
import { ConversationScrollAnchor } from "./ConversationScrollAnchor";
import { MESSAGE_ROLES } from "@/lib/constants";

const iniitalMessagesState = [
  {
    role: MESSAGE_ROLES.ASSISTANT,
    ariaLabel: `KezBot said:`,
    content:
      "Hey! I'm KezBot, your go-to source for information about Keziah Rackley-Gale. Ask me anything you want to know about her background, accomplishments, or current work.",
  },
];

export const ChatBot = () => {
  const [messages, setMessages] =
    useState<MessageProps[]>(iniitalMessagesState);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  return (
    <>
      {isError && <ErrorMessage />}
      <Conversation>
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
        <ConversationScrollAnchor isLoading={isLoading} />
      </Conversation>
      <QuestionForm isLoading={isLoading} />
    </>
  );
};
