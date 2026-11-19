import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { retryAfterRemaining } from "../../../utils/leadReadRetry";

export default function LeadReadRetry({ error, busy, onRetry, message }: {
  error: unknown; busy?: boolean; onRetry: () => void; message: string;
}) {
  const [seconds, setSeconds] = useState(() => Math.ceil(retryAfterRemaining(error) / 1000));
  useEffect(() => {
    const update = () => setSeconds(Math.ceil(retryAfterRemaining(error) / 1000));
    update();
    if (retryAfterRemaining(error) <= 0) return;
    const timer = setInterval(() => {
      update();
      if (retryAfterRemaining(error) <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [error]);
  const remaining = Math.max(seconds, Math.ceil(retryAfterRemaining(error) / 1000));
  return (
    <View style={{ padding: 16, alignItems: "center", gap: 10 }}>
      <Text accessibilityRole="alert" style={{ color: "#475569", textAlign: "center", fontSize: 13 }}>{message}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Retry loading"
        disabled={busy || remaining > 0}
        onPress={() => { if (!busy && retryAfterRemaining(error) === 0) onRetry(); }}
        style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: "#2E67BE", opacity: busy || remaining > 0 ? 0.6 : 1 }}>
        {busy ? <ActivityIndicator size="small" color="#fff" /> :
          <Text style={{ color: "#fff", fontWeight: "600" }}>{remaining > 0 ? `Retry in ${remaining}s` : "Retry"}</Text>}
      </Pressable>
    </View>
  );
}
