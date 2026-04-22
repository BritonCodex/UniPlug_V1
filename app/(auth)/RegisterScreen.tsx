import { router } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RegisterScreen = () => {
  return (
    <SafeAreaView>
      <Text>Register Screen</Text>
      <Button
        title="Sign-In"
        onPress={() => {
          router.push("/(auth)/LoginScreen");
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default RegisterScreen;
