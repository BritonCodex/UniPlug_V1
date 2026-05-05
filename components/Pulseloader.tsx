import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

// max scale needed to fill screen from center
const MAX_SCALE = Math.sqrt(width * width + height * height) / 64;

const PulseLoader = () => {
  const scale1 = useRef(new Animated.Value(0)).current;
  const scale2 = useRef(new Animated.Value(0)).current;

  const animate = (anim: Animated.Value, delay: number) => {
    return Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
  };

  useEffect(() => {
    animate(scale1, 0).start();
    animate(scale2, 1000).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [
              {
                scale: scale1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, MAX_SCALE],
                }),
              },
            ],
            opacity: scale1.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [0.6, 0.3, 0],
            }),
          },
        ]}
      />

      <Animated.View
        style={[
          styles.circle,
          {
            transform: [
              {
                scale: scale2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, MAX_SCALE],
                }),
              },
            ],
            opacity: scale2.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [0.6, 0.3, 0],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // full screen
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FF8F3A",
  },
});

export default PulseLoader;
