import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppTheme } from "../context/AppContext";

export default function ActiveCallScreen() {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.callerLabel, { color: colors.textSecondary || "#888" }]}>Calling...</Text>
      <Text style={[styles.phoneNumber, { color: colors.text }]}>+1 (555) 019-2034</Text>
      <Text style={[styles.timer, { color: colors.primary || "#22c55e" }]}>00:14</Text>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text }}>Mute</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text }}>Speaker</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.endCallBtn}>
        <Text style={styles.endCallText}>End Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  callerLabel: { fontSize: 16, marginBottom: 8 },
  phoneNumber: { fontSize: 28, fontWeight: "bold", marginBottom: 12 },
  timer: { fontSize: 20, marginBottom: 48 },
  controlsRow: { flexDirection: "row", marginBottom: 48 },
  controlBtn: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginHorizontal: 16 },
  endCallBtn: { width: 160, height: 50, borderRadius: 25, backgroundColor: "#ef4444", justifyContent: "center", alignItems: "center" },
  endCallText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
