import React from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { useAppTheme } from '../context/AppContext';
import { spacing, radius, typography } from '../constants/theme';
import Button from '../components/Button';

export default function AdditionalNumberCard() {
  const { colors } = useAppTheme();

  async function handleBuyExtraNumber() {
    try {
      const response = await fetch('https://6ix-mobile.onrender.com/api/numbers/purchase-extra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current_user', planId: 'pro' })
      });
      const data = await response.json();
      if (data.success && data.authorization_url) {
        await Linking.openURL(data.authorization_url);
      } else {
        Alert.alert('Error', data.message || 'Could not initialize extra number purchase.');
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Unable to reach server.');
    }
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Need Another Line?</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Add an extra US/Canada virtual number instantly for just $2.99/mo.
      </Text>
      <Button title="Get Additional Number" onPress={handleBuyExtraNumber} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radius.lg, marginVertical: spacing.md },
  title: { ...typography.h3, marginBottom: spacing.xs },
  subtitle: { ...typography.body, marginBottom: spacing.md }
});
