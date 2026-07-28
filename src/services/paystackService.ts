import { Linking } from "react-native";

export async function initializePaystackPayment({ email, amount, callbackUrl }: { email: string; amount: number; callbackUrl?: string }) {
  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: "Bearer sk_test_your_paystack_secret_key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack amount is in kobo/cents
        callback_url: callbackUrl || "https://6ixmobile.com/callback",
      }),
    });

    const data = await response.json();
    if (data.status && data.data?.authorization_url) {
      await Linking.openURL(data.data.authorization_url);
      return data.data;
    } else {
      throw new Error(data.message || "Payment initialization failed");
    }
  } catch (error) {
    console.error("Paystack Error:", error);
    throw error;
  }
}
