import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import zustandStorage from "./MMKV";

type UserProps = {
  _id: string;
  name: string;
  messages: string[];
  freinds: string[];
  requests: string[];
  serverCreated: string[];
  setName: (name: string) => void;
  setMessages: (messages: string[]) => void;
  setFreinds: (freinds: string[]) => void;
  setRequests: (requests: string[]) => void;
  setServerCreated: (serverCreated: string[]) => void;
};

type AuthProp = {
  token: string;
  setToken: (token: string) => void;
  getToken: () => string;
};

export const useAuth = create(
  persist<AuthProp>(
    (set, get) => ({
      token: "",
      setToken: (token: string) => set({ token: token }),
      getToken: () => get().token,
    }),
    {
      name: "private-user",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

export const useUser = create<UserProps>((set, get) => ({
  _id: "",
  name: "",
  messages: [],
  freinds: [],
  requests: [],
  serverCreated: [],
  setId: (id: string) => set({ _id: id }),
  setName: (name: string) => set({ name }),
  setMessages: (messages: string[]) => set({ messages }),
  setFreinds: (freinds: string[]) => set({ freinds }),
  setRequests: (requests: string[]) => set({ requests }),
  setServerCreated: (serverCreated: string[]) => set({ serverCreated }),
}));
