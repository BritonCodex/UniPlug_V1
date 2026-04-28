import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export default function TruckLoader() {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Truck bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Road + lamp movement
    Animated.loop(
      Animated.timing(moveAnim, {
        toValue: -350,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  return (
    <View style={styles.loader}>
      <View style={styles.wrapper}>
        {/* Truck Body */}
        <Animated.View
          style={[
            styles.truckBody,
            { transform: [{ translateY: bounceAnim }] },
          ]}
        >
          <Svg width="130" height="90" viewBox="0 0 198 93">
            <Path
              d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"
              fill="#F83D3D"
              stroke="#282828"
              strokeWidth="3"
            />
            <Rect
              x="6.5"
              y="1.5"
              width="121"
              height="90"
              rx="2.5"
              fill="#DFDFDF"
              stroke="#282828"
              strokeWidth="3"
            />
          </Svg>
        </Animated.View>

        {/* Tires */}
        <View style={styles.tires}>
          {[0, 1].map((_, i) => (
            <Svg key={i} width="24" height="24" viewBox="0 0 30 30">
              <Circle cx="15" cy="15" r="13.5" fill="#282828" />
              <Circle cx="15" cy="15" r="7" fill="#DFDFDF" />
            </Svg>
          ))}
        </View>

        {/* Road */}
        <View style={styles.road}>
          <Animated.View
            style={[styles.roadLine, { transform: [{ translateX: moveAnim }] }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wrapper: {
    width: 200,
    height: 100,
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden",
  },
  truckBody: {
    marginBottom: 6,
  },
  tires: {
    position: "absolute",
    bottom: 0,
    width: 130,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  road: {
    width: "100%",
    height: 2,
    backgroundColor: "#282828",
    position: "absolute",
    bottom: 0,
  },
  roadLine: {
    width: 100,
    height: 2,
    backgroundColor: "#fff",
  },
});
