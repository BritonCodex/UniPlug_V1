import PulseLoader from "@/components/Pulseloader";
import { DAY, persister, queryClient } from "@/lib/queryClient";
import useAuthStore from "@/store/auth.store";
import * as Sentry from "@sentry/react-native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";

Sentry.init({
  dsn: "https://c92b51042369060a5f19ca4ea7a03848@o4511282686656512.ingest.us.sentry.io/4511282690326528",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const RootLayout = () => {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();

  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  if (isLoading)
    return (
      <>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#e9dab3c4",
          }}
        >
          <PulseLoader />
        </View>
        {/* <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#444242c4",
          }}
        >
          <ActivityIndicator size={"large"} color={"orange"} />
        </View> */}
      </>
    );

  return (
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister, maxAge: DAY, buster: "v1" }}
  >
    <StatusBar style="dark" backgroundColor="#e9dab3" />

    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  </PersistQueryClientProvider>
);
};

export default Sentry.wrap(RootLayout);
