import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAppTheme } from "../context/AppContext";
import { spacing, radius, typography } from "../constants/theme";
import Button from "../components/Button";

export default function DialerScreen() {
  const { colors } = useAppTheme();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePress = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Please enter a phone number to call.");
      return;
    }
    Alert.alert("Calling", "Placing secure call to " + phoneNumber + "...");
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.displayContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.displayText, { color: colors.text }]}>
          {phoneNumber || "Enter number..."}
        </Text>
      </View>

      <View style={styles.keypad}>
        {keys.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.key, { backgroundColor: colors.surface }]}
            onPress={() => handlePress(item)}
          >
            <Text style={[styles.keyText, { color: colors.text }]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        {phoneNumber.length > 0 && (
          <Button title="Delete" onPress={handleDelete} style={styles.deleteBtn} />
        )}
        <Button title="Call" onPress={handleCall} style={styles.callBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: "center" },
  displayContainer: { padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing.xl, alignItems: "center" },
  displayText: { ...typography.h1, fontSize: 32 },
  keypad: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: spacing.xl },
  key: { width: "30%", aspectRatio: 2, justifyContent: "center", alignItems: "center", borderRadius: radius.md, marginBottom: spacing.md },
  keyText: { ...typography.h2 },
  actions: { flexDirection: "row", justifyContent: "center", gap: spacing.md },
  deleteBtn: { backgroundColor: "#ef4444", flex: 1 },
  callBtn: { backgroundColor: "#22c55e", flex: 1 }
});
