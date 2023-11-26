import { ChatCompletionMessage } from "@/app/api/chat/route";
import { MESSAGE_ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export type MessageProps = HTMLAttributes<HTMLElement> & ChatCompletionMessage;

export const Message = ({ role, content, ...props }: MessageProps) => {
  const isUser = role === MESSAGE_ROLES.USER;
  return (
    <section
      className={cn(
        "rounded-3xl p-4 text-black",
        isUser ? "rounded-br-none bg-blue" : "rounded-bl-none bg-purple"
      )}
      aria-label={`${isUser ? "You" : "KezBot"} said:`}
      {...props}
    >
      <p>{content}</p>
    </section>
  );
};
