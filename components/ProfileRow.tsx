import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const ORANGE = "#FF8F3A";

type Props = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  subtitle?: string;
  onPress: () => void;
};

// A tappable row used for shortcuts on the profile screen (My orders, Manage orders...).
const ProfileRow = ({ icon, label, subtitle, onPress }: Props) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.row, { opacity: pressed ? 0.9 : 1 }]}
  >
    <View style={styles.iconWrap}>
      <Feather name={icon} size={18} color={ORANGE} />
    </View>

    <View style={styles.texts}>
      <Text style={styles.label}>{label}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>

    <Feather name="chevron-right" size={20} color="#b5b5b5" />
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FF8F3A22",
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: "700", color: "#111" },
  subtitle: { fontSize: 12, color: "#888" },
});

export default ProfileRow;
