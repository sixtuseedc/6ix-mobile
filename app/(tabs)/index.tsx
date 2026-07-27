// app/(tabs)/index.tsx
// Dashboard & Active Numbers screen — the central hub.

import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useAppTheme } from "../../src/context/AppContext";
import { getProfile, getUserNumbers, setActiveNumber as persistActiveNumber } from "../../src/api/supabase";
import { spacing, radius, typography } from "../../src/constants/theme";
import Header from "../../src/components/Header";
import Card from "../../src/components/Card";
import Button from "../../src/components/Button";
import { formatPhoneNumber, formatCredits } from "../../src/utils/formatters";
import type { NumberRow, Profile } from "../../src/types/models";

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, activeNumber, setActiveNumber, numbers, setNumbers } = useAppTheme();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [profileData, numbersData] = await Promise.all([
        getProfile(user.id).catch(() => null),
        getUserNumbers(user.id).catch(() => [] as NumberRow[]),
      ]);
      setProfile(profileData);
      setNumbers(numbersData || []);

      if (!activeNumber && numbersData?.length) {
        setActiveNumber(numbersData[0]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSelectNumber(item: NumberRow) {
    setActiveNumber(item);
    if (user) {
      persistActiveNumber(user.id, item.id).catch(() => {});
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="6ix"
        subtitle={activeNumber ? `Active line: ${formatPhoneNumber(activeNumber.phone_number)}` : "No active line selected"}
        right={
          <View style={[styles.balancePill, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Credits</Text>
            <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>
              {formatCredits(profile?.credits ?? 0)}
            </Text>
          </View>
        }
      />

      <FlatList
        data={numbers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={
          numbers.length ? (
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              Your Numbers
            </Text>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={[typography.h3, { color: colors.textPrimary, textAlign: "center" }]}>
                No numbers yet
              </Text>
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: spacing.xs }]}>
                Get a virtual number to start texting and calling.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const isActive = activeNumber?.id === item.id;
          return (
            <Card onPress={() => handleSelectNumber(item)}>
              <View style={styles.numberRow}>
                <View>
                  <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>
                    {formatPhoneNumber(item.phone_number)}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                    {item.sms_enabled ? "SMS" : ""}
                    {item.sms_enabled && item.voice_enabled ? " · " : ""}
                    {item.voice_enabled ? "Voice" : ""}
                  </Text>
                </View>
                {isActive ? <View style={[styles.activeDot, { backgroundColor: colors.success }]} /> : null}
              </View>
            </Card>
          );
        }}
      />

      <View style={styles.footer}>
        <Button label="+ Get New Number" onPress={() => router.push("/number-selection")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100, flexGrow: 1 },
  balancePill: { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, alignItems: "center" },
  numberRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { marginTop: spacing.xxl, paddingHorizontal: spacing.lg },
  footer: { position: "absolute", left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
});
