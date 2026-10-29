import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

// A floating chat button. Place <AssistantButton /> inside a screen's container, e.g. the home screen.
// `bottom` clears the floating tab bar.
const AssistantButton = ({ bottom = 96 }: { bottom?: number }) => (
  <Pressable
    onPress={() => router.push("/assistant" as any)}
    style={({ pressed }) => [styles.fab, { bottom, opacity: pressed ? 0.9 : 1 }]}
    accessibilityLabel="Chat with the UniPlug assistant"
  >
    <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
  </Pressable>
);

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF8F3A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

export default AssistantButton;
