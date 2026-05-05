import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const SIZE = 40; // container size
const DOT = 8; // dot size
const DIST = 20; // movement distance

const CrossLoader = () => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  // helper to interpolate movement
  const move = (input: number[]) =>
    progress.interpolate({
      inputRange: [0, 0.35, 0.7, 1],
      outputRange: input,
    });

  return (
    <View style={styles.container}>
      {/* Top Right (pink) */}
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: "rgba(225,20,98,0.8)",
            transform: [
              { translateX: move([DIST, 0, -DIST, DIST]) },
              {
                translateY: move([-DIST / 2, -DIST / 2, -DIST / 2, -DIST / 2]),
              },
            ],
          },
        ]}
      />

      {/* Bottom Left (cyan) */}
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: "rgba(111,202,220,0.8)",
            transform: [
              { translateX: move([-DIST, 0, DIST, -DIST]) },
              { translateY: move([DIST / 2, DIST / 2, DIST / 2, DIST / 2]) },
            ],
          },
        ]}
      />

      {/* Bottom Right (green) */}
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: "rgba(61,184,143,0.8)",
            transform: [
              { translateX: move([DIST / 2, DIST / 2, DIST / 2, DIST / 2]) },
              { translateY: move([DIST, 0, -DIST, DIST]) },
            ],
          },
        ]}
      />

      {/* Top Left (yellow) */}
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: "rgba(233,169,32,0.8)",
            transform: [
              {
                translateX: move([-DIST / 2, -DIST / 2, -DIST / 2, -DIST / 2]),
              },
              { translateY: move([-DIST, 0, DIST, -DIST]) },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    position: "absolute",
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
});

export default CrossLoader;
