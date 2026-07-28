import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useAppTheme } from "../context/AppContext";
import { spacing, radius, typography } from "../constants/theme";

export default function MessagesScreen() {
  const { colors } = useAppTheme();
  const [conversations, setConversations] = useState([
    { id: "1", name: "+1 (555) 019-2834", lastMessage: "Hey, are we still meeting today?", time: "10:42 AM" },
    { id: "2", name: "+1 (555) 849-1022", lastMessage: "Your verification code is 4920", time: "Yesterday" }
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardContent}>
              <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.lastMessage, { color: colors.textSecondary || "#888" }]}>{item.lastMessage}</Text>
            </View>
            <Text style={[styles.timeText, { color: colors.textSecondary || "#888" }]}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  headerTitle: { ...typography.h1, marginBottom: spacing.lg, fontSize: 28 },
  card: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardContent: { flex: 1, marginRight: spacing.md },
  contactName: { ...typography.body, fontWeight: "bold", marginBottom: 4 },
  lastMessage: { ...typography.body, fontSize: 14 },
  timeText: { fontSize: 12 }
});
