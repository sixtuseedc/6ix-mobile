// src/components/Input.js
import React, { useState } from "react";
import { TextInput, View, Text, StyleSheet } from "react-native";
import { useAppTheme } from "../context/AppContext";
import { radius, spacing, typography } from "../constants/theme";

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  style,
}) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          typography.body,
          styles.input,
          {
            backgroundColor: colors.surfaceAlt,
            color: colors.textPrimary,
            borderColor: error ? colors.danger : focused ? colors.accent : colors.border,
          },
        ]}
      />
      {error ? (
        <Text style={[typography.tiny, { color: colors.danger, marginTop: spacing.xs }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
});
