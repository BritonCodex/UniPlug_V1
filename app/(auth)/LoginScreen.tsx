import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { AuthenticationProps } from "@/constants/props";
import { router } from "expo-router";

import { signIn } from "@/lib/appwrite";
import * as Sentry from "@sentry/react-native";
const { width, height } = Dimensions.get("screen");

const useSignin = (): AuthenticationProps => {
  const [isSecure, setIsSecure] = useState(false);
  return {
    isSecure,
    setIsSecure,
  };
};

const LoginScreen = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isSecure, setIsSecure } = useSignin();

  //create a submitting functionality
  /** an async function that checks using try..catch..finally
   *  check if the email and passord are not there, then send an error message with the error
   *   no error-> success and replace the screen with home screen
   * 1. call the appwrite sign in fuction from the database
   * 2. catch the error
   * 3. finally-> set the submitting proccess to false/ end the process
   */

  const submit = async () => {
    if (!form.email || !form.password)
      return Alert.alert(
        "Authentication Error",
        "Please enter valid credentions",
      );

    setIsSubmitting(true);

    try {
      await signIn({ email: form.email, password: form.password });
      router.replace("/(tabs)/Homescreen");
    } catch (error: any) {
      Alert.alert("Error", error.message);
      Sentry.captureEvent(error);
    } finally {
      setIsSubmitting(false);
      console.log("ending Submission...");
    }
  };
  return (
    <View>
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            marginTop: -10,
            alignSelf: "center",
            fontSize: 24,
            fontWeight: "bold",
            color: "#767676",
          }}
        >
          Welcome to Uniplug
        </Text>
        <View>
          <View style={{ marginHorizontal: 10 }}>
            <Text style={{ fontSize: 13, color: "#767676", letterSpacing: 1 }}>
              Discover new products with Uniplug. We're here to provide you with
              seamless shopping experience.
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#222222ff",
                fontWeight: "semibold",
                textDecorationLine: "underline",
              }}
            >
              You Order we Deliver
            </Text>
          </View>
        </View>
      </View>
      <View style={{ marginTop: 20 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#767676" }}>
            Account Login
          </Text>
          <View style={{ marginVertical: 10, marginHorizontal: 10 }}>
            <CustomInput
              placeholder="example@gmail.com.."
              label="Email"
              value={form.email}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, email: text }))
              }
              keyboardType="default"
            />
            <CustomInput
              placeholder="password"
              label="Password"
              value={form.password}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, password: text }))
              }
              isSecure
              secureTextEntry={isSecure}
              onSecurePress={() => setIsSecure(!isSecure)}
              keyboardType="default"
            />
            <Pressable
              onPress={() => {
                console.log("forgot password");
              }}
              style={{ alignSelf: "center", marginVertical: 8 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "semibold",
                  color: "#767676",
                }}
              >
                Forgot/Reset Password?
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ alignContent: "center", marginHorizontal: 10 }}>
          <CustomButton
            isLoading={isSubmitting}
            onPress={submit}
            text="Login"
            buttonStyles={{
              backgroundColor: "#FF8F3A",
              width: width / 1.1,
              marginHorizontal: 20,
              alignSelf: "center",
            }}
            textStyles={{
              color: "white",
              fontWeight: "bold",
            }}
          />

          <View
            style={{
              alignItems: "center",
              flexDirection: "column",
              justifyContent: "center",
              marginVertical: 20,
            }}
          >
            <Text>Dont't Have an Account?</Text>
            <Pressable
              onPress={() => {
                router.replace("/(auth)/RegisterScreen");
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "semibold",
                  color: "#767676",
                }}
              >
                Register
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default LoginScreen;
