import { useEffect, useRef } from "react";
import { Loading } from "./Loading";
import { useInView } from "react-intersection-observer";
import { useAtBottom } from "@/lib/hooks/useAtBottom";

type ConversationScrollAnchorProps = { isLoading: boolean };

export const ConversationScrollAnchor = ({
  isLoading,
}: ConversationScrollAnchorProps) => {
  const isAtBottom = useAtBottom();

  const { ref, entry, inView } = useInView({
    trackVisibility: isLoading,
    delay: 100,
    rootMargin: "0px 0px -150px 0px",
  });

  useEffect(() => {
    if (isAtBottom && isLoading && !inView) {
      entry?.target.scrollIntoView({
        block: "start",
      });
    }
  }, [inView, entry, isAtBottom, isLoading]);

  return <div ref={ref}>{isLoading && <Loading />}</div>;
};
