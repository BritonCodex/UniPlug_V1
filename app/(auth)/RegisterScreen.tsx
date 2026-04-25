import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import CheckBoxComponent from "@/components/CheckBoxComponent";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { AuthenticationProps } from "@/constants/props";
import { createUser } from "@/lib/appwrite";
import { router } from "expo-router";
const { width, height } = Dimensions.get("screen");

const useSignin = (): AuthenticationProps => {
  const [isSecure, setIsSecure] = useState(false);
  return {
    isSecure,
    setIsSecure,
  };
};

const RegisterScreen = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { isSecure, setIsSecure } = useSignin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password)
      return Alert.alert(
        "Authentication Error",
        "Please enter valid credentions",
      );

    setIsSubmitting(true);

    try {
      await createUser({
        email: form.email,
        password: form.password,
        name: form.name,
      });

      Alert.alert("Authentication Success", "User signed in successfully");
      router.replace("/(tabs)/Homescreen");
    } catch (error: any) {
      Alert.alert("Error", error.message);
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
            Create Account
          </Text>
          <View style={{ marginVertical: 10, marginHorizontal: 10 }}>
            <CustomInput
              placeholder="enter username"
              label="Username"
              value={form.name}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, name: text }))
              }
              keyboardType="default"
            />
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
              marginHorizontal: 10,
              flexDirection: "row",
              gap: 10,
              marginTop: 10,
            }}
          >
            <CheckBoxComponent
              onPress={(e) => {
                console.log("item", e);
              }}
              isChecked={false}
            />
            <Text
              style={{ fontWeight: "400", textDecorationLine: "underline" }}
            >
              Read and Agreed to the terms and conditions
            </Text>
          </View>

          <View
            style={{
              alignItems: "center",
              flexDirection: "column",
              justifyContent: "center",
              marginVertical: 10,
            }}
          >
            <Text>Already have an Account?</Text>
            <Pressable
              onPress={() => {
                router.replace("/(auth)/LoginScreen");
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "semibold",
                  color: "#767676",
                }}
              >
                Login
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default RegisterScreen;
