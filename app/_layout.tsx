import { Stack } from "expo-router";
import React from "react";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://c92b51042369060a5f19ca4ea7a03848@o4511282686656512.ingest.us.sentry.io/4511282690326528',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const RootLayout = () => {
  const isAuthenticated = false;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="(tabs)"
    >
      {/* <Stack.Screen name="(auth)" /> */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};

export default Sentry.wrap(RootLayout);
