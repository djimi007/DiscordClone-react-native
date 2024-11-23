import { StateStorage } from "zustand/middleware";
import * as storage from "expo-secure-store";

const zustandStorage: StateStorage = {
  setItem: async (name, value) => {
    const result = await storage.setItemAsync(name, value);
    return result;
  },
  getItem: async (name) => {
    const value = await storage.getItemAsync(name);
    return value ?? null;
  },
  removeItem: async (name) => {
    const result = await storage.deleteItemAsync(name);
    return result;
  },
};

export default zustandStorage;
