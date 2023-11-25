import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleInvalidContentType = () =>
  new Response(null, {
    status: 406,
    statusText: "Invalid Content-Type Header",
  });

export const handleInvalidMethod = (method: string) =>
  new Response(null, {
    status: 405,
    statusText: `Method ${method} Not Allowed`,
  });

export const handleInvalidPayload = () =>
  new Response(null, {
    status: 400,
    statusText: "Invalid Payload",
  });
