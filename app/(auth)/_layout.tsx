import { images } from "@/constants/images";
import useAuthStore from "@/store/auth.store";
import { Redirect, Slot } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

const { height, width } = Dimensions.get("screen");
const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Redirect href={"/(tabs)/Homescreen"} />;
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={[{ height: "100%" }]}
      >
        <View
          style={{
            width: "100%",
            alignItems: "center",
            flex: 2,
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <Image
            source={images.logoImage}
            resizeMode="contain"
            style={{
              height: height / 4,
              width: width / 2,
              marginTop: 10,
            }}
          />
        </View>

        <Slot />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({});

export default AuthLayout;
