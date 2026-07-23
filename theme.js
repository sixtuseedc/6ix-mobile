// src/components/Button.js
import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAppTheme } from "../context/AppContext";
import { radius, spacing, typography } from "../constants/theme";

export default function Button({
  label,
  onPress,
  variant = "primary", // "primary" | "secondary" | "danger" | "ghost"
  loading = false,
  disabled = false,
  icon = null,
  style,
}) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;

  const backgrounds = {
    primary: colors.accent,
    secondary: colors.surfaceAlt,
    danger: colors.danger,
    ghost: "transparent",
  };

  const textColors = {
    primary: "#FFFFFF",
    secondary: colors.textPrimary,
    danger: "#FFFFFF",
    ghost: colors.accent,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: backgrounds[variant],
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
          borderWidth: variant === "ghost" ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              typography.bodyStrong,
              { color: textColors[variant], marginLeft: icon ? spacing.xs : 0 },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
});
