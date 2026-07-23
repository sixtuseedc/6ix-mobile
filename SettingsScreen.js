// src/payment/PaymentModal.js
// Structural placeholder for a real checkout flow (Stripe PaymentSheet or
// Paystack inline checkout). Wire the real SDK call inside `handleConfirm`
// once FEATURES.PAYMENTS_ENABLED is turned on — nothing else in the app
// needs to change since screens only ever import { openPaymentModal }.

import React from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { useAppTheme } from "../context/AppContext";
import { spacing, radius, typography } from "../constants/theme";
import Button from "../components/Button";
import { FEATURES } from "../constants/config";

export default function PaymentModal({ visible, plan, onClose, onSuccess }) {
  const { colors } = useAppTheme();

  async function handleConfirm() {
    if (!FEATURES.PAYMENTS_ENABLED) {
      // No gateway wired up yet — this is a structural placeholder only.
      onClose?.();
      return;
    }

    // TODO: integrate Stripe PaymentSheet / Paystack inline checkout here,
    // using plan.priceId. On success, call onSuccess(plan).
    onSuccess?.(plan);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>
            {plan?.name || plan?.label || "Checkout"}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            {plan?.description ||
              (plan?.credits ? `${plan.credits} credits` : "")}
          </Text>

          <View style={styles.priceRow}>
            <Text style={[typography.h2, { color: colors.textPrimary }]}>
              {plan?.priceLabel}
            </Text>
          </View>

          {!FEATURES.PAYMENTS_ENABLED && (
            <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.md }]}>
              Payment gateway not yet connected — this is a placeholder screen.
            </Text>
          )}

          <Button label="Confirm" onPress={handleConfirm} />
          <Pressable onPress={onClose} style={{ marginTop: spacing.md, alignItems: "center" }}>
            <Text style={[typography.body, { color: colors.textMuted }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  priceRow: {
    marginVertical: spacing.md,
  },
});
