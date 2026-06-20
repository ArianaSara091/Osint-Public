import { create } from "zustand";

interface ThemeState {
  theme: "dark";
}

export const useTheme = create<ThemeState>(() => ({
  theme: "dark",
}));
