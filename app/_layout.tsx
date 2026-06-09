// app/_layout.tsx

import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { initDatabase } from "./database/banco";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Garante que o banco é criado ANTES de qualquer tela ser exibida
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error("Falha ao inicializar banco:", err);
        // Mesmo com erro, deixa o app abrir para não travar o usuário
        setDbReady(true);
      });
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
