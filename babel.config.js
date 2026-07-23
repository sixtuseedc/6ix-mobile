// src/screens/SettingsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/AppContext";
import { getProfile } from "../api/supabase";
import { spacing, radius, typography } from "../constants/theme";
import Header from "../components/Header";
import Card from "../components/Card";
import PaymentModal from "../payment/PaymentModal";
import { CREDIT_PACKS } from "../payment/plansConfig";
import { formatCredits } from "../utils/formatters";

function Row({ label, value, onPress, danger, colors }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text
        style={[
          typography.body,
          { color: danger ? colors.danger : colors.textPrimary },
        ]}
      >
        {label}
      </Text>
      {value ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>{value}</Text>
      ) : (
        <Text style={{ color: colors.textMuted }}>›</Text>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { colors, mode, setThemeOverride } = useAppTheme();

  const [profile, setProfile] = useState(null);
  const [topUpVisible, setTopUpVisible] = useState(false);
  const [selectedPack, setSelectedPack] = useState(CREDIT_PACKS[0]);

  useEffect(() => {
    if (user) {
      getProfile(user.id)
        .then(setProfile)
        .catch(() => setProfile(null));
    }
  }, [user]);

  function handleTopUp(pack) {
    setSelectedPack(pack);
    setTopUpVisible(true);
  }

  function handleThemeToggle() {
    setThemeOverride(mode === "dark" ? "light" : "dark");
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Settings" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>
          ACCOUNT
        </Text>
        <Card>
          <Row label="Email" value={user?.email || "—"} colors={colors} />
          <Divider colors={colors} />
          <Row
            label="Credit Balance"
            value={`${formatCredits(profile?.credits ?? 0)} credits`}
            colors={colors}
          />
        </Card>

        <Text
          style={[
            typography.caption,
            { color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.xs },
          ]}
        >
          BILLING
        </Text>
        <Card>
          {CREDIT_PACKS.map((pack, i) => (
            <React.Fragment key={pack.id}>
              {i > 0 ? <Divider colors={colors} /> : null}
              <Row
                label={`Top Up · ${pack.credits} credits`}
                value={pack.priceLabel}
                onPress={() => handleTopUp(pack)}
                colors={colors}
              />
            </React.Fragment>
          ))}
        </Card>

        <Text
          style={[
            typography.caption,
            { color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.xs },
          ]}
        >
          PREFERENCES
        </Text>
        <Card>
          <Row
            label="Appearance"
            value={mode === "dark" ? "Dark" : "Light"}
            onPress={handleThemeToggle}
            colors={colors}
          />
          <Divider colors={colors} />
          <Row label="Notifications" value="On" colors={colors} />
        </Card>

        <Text
          style={[
            typography.caption,
            { color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.xs },
          ]}
        >
          ACCOUNT ACTIONS
        </Text>
        <Card>
          <Row label="Log Out" onPress={() => signOut()} danger colors={colors} />
        </Card>
      </ScrollView>

      <PaymentModal
        visible={topUpVisible}
        plan={selectedPack}
        onClose={() => setTopUpVisible(false)}
        onSuccess={() => setTopUpVisible(false)}
      />
    </View>
  );
}

function Divider({ colors }) {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
});
