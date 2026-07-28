import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { useAppTheme } from "../context/AppContext";
import { initializePaystackPayment } from "../services/paystackService";

export default function AccountScreen() {
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [numbers, setNumbers] = useState([
    { id: "1", number: "+1 (555) 019-2034", plan: "US Virtual Number", expires: "2026-08-28", price: 2000 },
    { id: "2", number: "+1 (555) 849-1022", plan: "US Toll-Free", expires: "2026-09-15", price: 3500 },
  ]);

  const handleRenew = async (item: any) => {
    try {
      setLoading(true);
      await initializePaystackPayment({
        email: "user@6ixmobile.com",
        amount: item.price,
      });
    } catch (error: any) {
      Alert.alert("Payment Error", error.message || "Could not initialize checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>My Virtual Numbers</Text>
      <FlatList
        data={numbers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.phoneNumber, { color: colors.primary || "#22c55e" }]}>{item.number}</Text>
            <Text style={[styles.planText, { color: colors.text }]}>{item.plan} - ₦{item.price}</Text>
            <Text style={[styles.expiryText, { color: colors.textSecondary || "#888" }]}>Expires: {item.expires}</Text>
            <TouchableOpacity 
              style={[styles.renewBtn, { backgroundColor: colors.primary || "#22c55e" }]} 
              onPress={() => handleRenew(item)}
              disabled={loading}
            >
              <Text style={styles.renewText}>{loading ? "Processing..." : "Renew / Pay with Paystack"}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12 },
  phoneNumber: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  planText: { fontSize: 14, marginBottom: 2 },
  expiryText: { fontSize: 12, marginBottom: 12 },
  renewBtn: { padding: 10, borderRadius: 8, alignItems: "center" },
  renewText: { color: "#fff", fontWeight: "bold" },
});
