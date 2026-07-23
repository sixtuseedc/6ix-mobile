// src/components/Header.js
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useAppTheme } from "../context/AppContext";
import { spacing, typography } from "../constants/theme";

export default function Header({ title, subtitle, right, onBack }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={{ marginBottom: spacing.xs }}>
            <Text style={[typography.body, { color: colors.accent }]}>Back</Text>
          </Pressable>
        ) : null}
        <Text style={[typography.h1, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});
