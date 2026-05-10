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
      {/* LEFT SIDE */}
      <View style={styles.left}>
        {icon && <View style={styles.iconBox}>{icon}</View>}

        <View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>
            {value && value.length > 0 ? value : "Not set"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "92%",
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginVertical: 6,

    borderRadius: 16,

    // LIGHT PREMIUM GLASS STYLE
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECECEC",

    // soft shadow (iOS + Android)
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F3F4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8A8A8A",
    marginBottom: 2,
    letterSpacing: 0.3,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
});

export default ProfileFieldCard;
