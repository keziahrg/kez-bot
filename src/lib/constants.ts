export const MESSAGE_ROLES = {
  SYSTEM: "system",
  ASSISTANT: "assistant",
  USER: "user",
} as const;

export const CHAT_BOT_STATUS = {
  GENERATING_MESSAGE: "generating_message",
  AWAITING_MESSAGE: "awaiting_message",
} as const;

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
} as const;
