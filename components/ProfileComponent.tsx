import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type ProfileFieldProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

const ProfileFieldCard = ({ label, value, icon }: ProfileFieldProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={styles.value}>
        {value && value.length > 0 ? value : "Not set"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "70%",
    padding: 8,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    borderWidth: 0.5,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  value: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },
});

export default ProfileFieldCard;
