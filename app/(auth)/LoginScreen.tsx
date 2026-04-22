import { router } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
  return (
    <SafeAreaView>
      <Text>Login screen</Text>
      <Button
        title="sign Up"
        onPress={() => {
          router.push("/(auth)/RegisterScreen");
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default LoginScreen;
