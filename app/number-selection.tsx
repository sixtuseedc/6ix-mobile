// app/number-selection.tsx
// Number Selection & Purchase Flow — pushed on top of the tabs from the
// Dashboard's "+ Get New Number" button.

import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { useAppTheme } from "../src/context/AppContext";
import { searchAvailableNumbers, provisionNumber } from "../src/api/telnyx";
import { saveProvisionedNumber } from "../src/api/supabase";
import { spacing, radius, typography } from "../src/constants/theme";
import Header from "../src/components/Header";
import Card from "../src/components/Card";
import Input from "../src/components/Input";
import Button from "../src/components/Button";
import PaymentModal from "../src/payment/PaymentModal";
import { formatPhoneNumber } from "../src/utils/formatters";
import type { AvailableNumber, CheckoutItem } from "../src/types/models";

const NUMBER_PRICE_PLAN = {
  id: "single_number",
  name: "New Virtual Number",
  description: "One-time activation",
  priceLabel: "$1.00",
};

export default function NumberSelectionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, numbers, setNumbers, setActiveNumber } = useAppTheme();

  const [countryCode, setCountryCode] = useState("US");
  const [areaCode, setAreaCode] = useState("");
  const [results, setResults] = useState<AvailableNumber[]>([]);
  const [searching, setSearching] = useState(false);
  const [provisioning, setProvisioning] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [checkoutNumber, setCheckoutNumber] = useState<AvailableNumber | null>(null);

  async function handleSearch() {
    setError("");
    setSearching(true);
    try {
      const found = await searchAvailableNumbers({ countryCode, areaCode });
      setResults(found);
    } catch (e: any) {
      setError(e?.message || "Could not search numbers.");
    } finally {
      setSearching(false);
    }
  }

  function handleChooseNumber(item: AvailableNumber) {
    setCheckoutNumber(item);
  }

  async function handleConfirmPurchase() {
    if (!checkoutNumber || !user) return;
    setProvisioning(checkoutNumber.phoneNumber);
    setError("");
    try {
      const purchased = await provisionNumber(checkoutNumber.phoneNumber);
      const saved = await saveProvisionedNumber({
        userId: user.id,
        phoneNumber: purchased.phoneNumber,
        telnyxNumberId: purchased.telnyxNumberId,
        countryCode,
        smsEnabled: checkoutNumber.features.includes("sms"),
        voiceEnabled: checkoutNumber.features.includes("voice"),
      });
      setNumbers([saved, ...numbers]);
      setActiveNumber(saved);
      setCheckoutNumber(null);
      router.back();
    } catch (e: any) {
      setError(e?.message || "Could not complete purchase.");
    } finally {
      setProvisioning(null);
    }
  }

  const checkoutPlan: CheckoutItem | null = checkoutNumber
    ? { ...NUMBER_PRICE_PLAN, description: formatPhoneNumber(checkoutNumber.phoneNumber) }
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Get a Number" onBack={() => router.back()} />

      <View style={styles.searchRow}>
        <Input
          label="Country Code"
          value={countryCode}
          onChangeText={(t) => setCountryCode(t.toUpperCase())}
          placeholder="US"
          style={{ flex: 1, marginRight: spacing.sm }}
          autoCapitalize="characters"
        />
        <Input
          label="Area Code"
          value={areaCode}
          onChangeText={setAreaCode}
          placeholder="415"
          keyboardType="number-pad"
          style={{ flex: 1, marginLeft: spacing.sm }}
        />
      </View>

      <View style={styles.searchButtonWrap}>
        <Button label="Search Numbers" onPress={handleSearch} loading={searching} />
      </View>

      {error ? (
        <Text style={[typography.caption, { color: colors.danger, paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
          {error}
        </Text>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.phoneNumber}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !searching ? (
            <Text style={[typography.body, { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl }]}>
              Search for available numbers by country and area code.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.resultRow}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>
                  {formatPhoneNumber(item.phoneNumber)}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  {item.region || countryCode} · {item.features.join(", ")}
                </Text>
              </View>
              <View style={styles.tagsRow}>
                {item.features.map((f) => (
                  <View key={f} style={[styles.tag, { backgroundColor: colors.surfaceAlt }]}>
                    <Text style={[typography.tiny, { color: colors.textSecondary }]}>{f.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
              <Button
                label={provisioning === item.phoneNumber ? "" : "Select"}
                loading={provisioning === item.phoneNumber}
                onPress={() => handleChooseNumber(item)}
                style={{ marginLeft: spacing.sm, paddingHorizontal: spacing.md }}
              />
            </View>
          </Card>
        )}
      />

      <PaymentModal
        visible={!!checkoutNumber}
        plan={checkoutPlan}
        onClose={() => setCheckoutNumber(null)}
        onSuccess={handleConfirmPurchase}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: "row", paddingHorizontal: spacing.lg },
  searchButtonWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  resultRow: { flexDirection: "row", alignItems: "center" },
  tagsRow: { flexDirection: "row" },
  tag: { borderRadius: radius.sm, paddingHorizontal: spacing.xs, paddingVertical: 2, marginLeft: spacing.xs },
});
