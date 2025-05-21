export type ThemeType = "light" | "dark" | "system";

export type Message = {
  sender: "user" | "bot";
  text: string;
};

export type SessionType = {
  id: string;
  name?: string;
  chat: Message[];
};

export type ChatData = {
  name?: string;
  chat: Message[];
};

export type ChatList = Record<string, ChatData>;
