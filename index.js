// src/context/AppContext.js
// Holds cross-screen app state that isn't auth: color scheme + which
// virtual number is currently "active" for sending SMS/calls.

import React, { createContext, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { theme } from "../constants/theme";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const systemScheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState(null); // "dark" | "light" | null
  const [activeNumber, setActiveNumber] = useState(null); // full number row from Supabase
  const [numbers, setNumbers] = useState([]);

  const mode = themeOverride ?? systemScheme ?? "dark";
  const colors = theme[mode] ?? theme.dark;

  const value = useMemo(
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
