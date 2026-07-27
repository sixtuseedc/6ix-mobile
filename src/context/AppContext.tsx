// src/context/AppContext.tsx
// Holds cross-screen app state that isn't auth: color scheme + which
// virtual number is currently "active" for sending SMS/calls.

import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { theme, ThemeColors, ThemeMode } from "../constants/theme";
import type { NumberRow } from "../types/models";

interface AppContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  setThemeOverride: (mode: ThemeMode | null) => void;
  activeNumber: NumberRow | null;
  setActiveNumber: (n: NumberRow | null) => void;
  numbers: NumberRow[];
  setNumbers: (n: NumberRow[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<ThemeMode | null>(null);
  const [activeNumber, setActiveNumber] = useState<NumberRow | null>(null);
  const [numbers, setNumbers] = useState<NumberRow[]>([]);

  const mode: ThemeMode = themeOverride ?? (systemScheme as ThemeMode) ?? "dark";
  const colors = theme[mode] ?? theme.dark;

  const value = useMemo<AppContextValue>(
    () => ({
      mode,
      colors,
      setThemeOverride,
      activeNumber,
      setActiveNumber,
      numbers,
      setNumbers,
    }),
    [mode, colors, activeNumber, numbers]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppTheme must be used within AppProvider");
  return ctx;
}
