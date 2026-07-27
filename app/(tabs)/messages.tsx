// app/(tabs)/messages.tsx
// Conversations & Messages list — overview of all active SMS threads.

import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "../../src/context/AppContext";
import { getThreadsForNumber } from "../../src/api/supabase";
import { spacing, radius, typography } from "../../src/constants/theme";
import Header from "../../src/components/Header";
import Card from "../../src/components/Card";
import { formatPhoneNumber, formatRelativeTime } from "../../src/utils/formatters";
import type { Thread } from "../../src/types/models";

export default function MessagesScreen() {
  const router = useRouter();
  const { colors, activeNumber } = useAppTheme();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadThreads = useCallback(async () => {
    if (!activeNumber) {
      setThreads([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await getThreadsForNumber(activeNumber.id);
      setThreads(data || []);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeNumber]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Messages" subtitle={activeNumber ? formatPhoneNumber(activeNumber.phone_number) : "No active line"} />

      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadThreads();
            }}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={[typography.h3, { color: colors.textPrimary, textAlign: "center" }]}>
                No conversations yet
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: spacing.xs }]}>
                {activeNumber
                  ? "Texts you send or receive will show up here."
                  : "Select an active line on the Dashboard to see messages."}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Card
            onPress={() =>
              router.push({
                pathname: "/chat/[threadId]",
                params: {
                  threadId: item.id,
                  contactNumber: item.contact_number,
                  numberId: activeNumber?.id ?? "",
                },
              })
            }
          >
            <View style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[typography.bodyStrong, { color: colors.textSecondary }]}>
                  {(item.contact_name || item.contact_number || "?").slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <View style={styles.rowBetween}>
                  <Text style={[typography.bodyStrong, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.contact_name || formatPhoneNumber(item.contact_number)}
                  </Text>
                  <Text style={[typography.tiny, { color: colors.textMuted }]}>
                    {formatRelativeTime(item.last_message_at)}
                  </Text>
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                  {item.last_message_preview || ""}
                </Text>
              </View>
              {item.unread_count > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                  <Text style={[typography.tiny, { color: "#fff" }]}>{item.unread_count}</Text>
                </View>
              ) : null}
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badge: { minWidth: 20, height: 20, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", marginLeft: spacing.sm, paddingHorizontal: 5 },
  empty: { marginTop: spacing.xxl },
});
