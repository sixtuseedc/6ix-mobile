// src/navigation/RootNavigator.js
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/AppContext";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

export default function RootNavigator() {
  const { session, initializing } = useAuth();
  const { colors, mode } = useAppTheme();

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const navTheme = {
    dark: mode === "dark",
    colors: {
      primary: colors.accent,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {session ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
