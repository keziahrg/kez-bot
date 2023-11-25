import { MESSAGE_ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export type MessageProps = HTMLAttributes<HTMLElement> & {
  role: (typeof MESSAGE_ROLES)[keyof typeof MESSAGE_ROLES];
  content: string;
};

export const Message = ({ role, content, ...props }: MessageProps) => (
  <section
    className={cn(
      "rounded-3xl p-4 text-black",
      role === "user" ? "rounded-br-none bg-blue" : "rounded-bl-none bg-purple"
    )}
    {...props}
  >
    <p>{content}</p>
  </section>
);
