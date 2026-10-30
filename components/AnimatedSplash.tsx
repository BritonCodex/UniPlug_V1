import PulseLoader from "@/components/Pulseloader";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type Props = {
  ready: boolean; // true once auth/loading is finished
  onFinish: () => void;
};

const logo = require("../assets/images/splash-icon.png");

export default function AnimatedSplash({ ready, onFinish }: Props) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const loaderFade = useRef(new Animated.Value(0)).current;

  const [laidOut, setLaidOut] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  // Intro: starts as soon as the view is on screen
  useEffect(() => {
    if (!laidOut) return;

    // Native splash is blank, so hide it right away
    SplashScreen.hideAsync().catch(() => {});

    Animated.timing(loaderFade, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      // Logo fades + pops in
      Animated.parallel([
        Animated.timing(logoFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1.15,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),
      // Wiggle while settling back
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(rotate, {
            toValue: -1,
            duration: 140,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration: 220,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 0,
            duration: 160,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(250),
    ]).start(() => setIntroDone(true));
  }, [laidOut]);

  // Exit: only when the intro has played AND the app is ready
  useEffect(() => {
    if (!introDone || !ready) return;

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, [introDone, ready]);

  const rotation = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-8deg", "8deg"],
  });

  return (
    <Animated.View
      style={[styles.container, { opacity: fade }]}
      onLayout={() => setLaidOut(true)}
    >
      {/* Pulse loader behind the logo */}
      <Animated.View style={[styles.loaderWrap, { opacity: loaderFade }]}>
        <View>
          <PulseLoader />
        </View>
      </Animated.View>

      {/* Logo in front */}
      <Animated.Image
        source={logo}
        style={[
          styles.logo,
          {
            opacity: logoFade,
            transform: [{ scale }, { rotate: rotation }],
          },
        ]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff", // must match app.json splash backgroundColor
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  logo: {
    width: 220,
    height: 220,
  },
  loaderWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});
