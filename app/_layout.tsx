import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      //initialRouteName="(auth)"
    >
      {/* <Stack.Screen name="(auth)" /> */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};

const styles = StyleSheet.create({});

export default RootLayout;
