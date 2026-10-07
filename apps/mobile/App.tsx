import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@zuridesk/ui/tokens";

import { getPublicEnvironment } from "./src/config/public-env";

export default function App() {
  const environment = getPublicEnvironment();

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Text style={styles.eyebrow}>ZURIDESK</Text>
        <Text style={styles.title}>Your day, beautifully organized.</Text>
        <Text style={styles.body}>
          The mobile foundation is ready for bookings, customers, staff, and point-of-sale flows.
        </Text>
        <View style={styles.status}>
          <Text style={styles.statusText}>API · {environment.EXPO_PUBLIC_API_URL}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.paper
  },
  card: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 4
  },
  eyebrow: {
    color: colors.plum,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2
  },
  title: {
    color: colors.ink,
    fontSize: 42,
    fontWeight: "600",
    lineHeight: 45
  },
  body: {
    color: "#6f645e",
    fontSize: 17,
    lineHeight: 26
  },
  status: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: "#edf7f0"
  },
  statusText: {
    color: colors.leaf,
    fontSize: 12,
    fontWeight: "600"
  }
});
