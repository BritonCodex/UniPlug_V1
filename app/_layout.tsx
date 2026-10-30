import AnimatedSplash from "@/components/AnimatedSplash";
import { DAY, persister, queryClient } from "@/lib/queryClient";
import useAuthStore from "@/store/auth.store";
import * as Sentry from "@sentry/react-native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";

// Keep the native splash until AnimatedSplash hides it
SplashScreen.preventAutoHideAsync();

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
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  return (
    <>
      {!isLoading && (
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
      )}

      {!splashDone && (
        <AnimatedSplash
          ready={!isLoading}
          onFinish={() => setSplashDone(true)}
        />
      )}
    </>
  );
};

export default Sentry.wrap(RootLayout);
