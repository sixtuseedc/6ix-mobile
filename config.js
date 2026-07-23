// src/components/Card.js
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useAppTheme } from "../context/AppContext";
import { radius, spacing } from "../constants/theme";

export default function Card({ children, onPress, style }) {
  const { colors } = useAppTheme();
  const baseStyle = [
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.border },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...baseStyle, { opacity: pressed ? 0.85 : 1 }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={baseStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});
