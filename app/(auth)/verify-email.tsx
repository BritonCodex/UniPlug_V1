import { account } from "@/lib/appwrite";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

export default function VerifyEmailScreen() {
  const { userId, secret } = useLocalSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!userId || !secret) {
          Alert.alert("Invalid Link", "Missing verification data");
          router.replace("/(auth)/LoginScreen");
          return;
        }

        // 🔥 Confirm verification with Appwrite
        await account.updateVerification(userId as string, secret as string);

        Alert.alert("Verified!", "Your email has been successfully verified.");

        // redirect to login or home
        router.replace("/(auth)/LoginScreen");
      } catch (error: any) {
        Alert.alert("Verification Failed", error.message);
        router.replace("/(auth)/LoginScreen");
      }
    };

    verifyEmail();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>Verifying your email...</Text>
    </View>
  );
}
