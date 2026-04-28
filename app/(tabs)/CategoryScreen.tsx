import seed from "@/lib/seed";
import React from "react";
import { Button, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CategoryScreen = () => {
  return (
    <SafeAreaView>
      <Text>Category screen</Text>
      <Button
        title="Seed"
        onPress={() =>
          seed().catch((error) => console.log("Failed to seed", error))
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default CategoryScreen;
