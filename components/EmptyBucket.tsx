import React from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const ORANGE = "#FF8F3A";
const DEEP = "#E8731A";
const DARK = "#3B2D2A";

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

// An empty-state illustration drawn with plain Views (no SVG package needed):
// a floating orange bucket, a soft shadow, twinkling sparkles and a message below.
const EmptyBucket = ({ title, subtitle, actionLabel, onAction }: Props) => {
  const float = React.useRef(new Animated.Value(0)).current;
  const sparkles = React.useRef(
    [0, 1, 2].map(() => new Animated.Value(0.2)),
  ).current;

  React.useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const sparkleLoops = sparkles.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 500),
          Animated.timing(v, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0.2,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    floatLoop.start();
    sparkleLoops.forEach((l) => l.start());
    return () => {
      floatLoop.stop();
      sparkleLoops.forEach((l) => l.stop());
    };
  }, [float, sparkles]);

  const lift = float.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const shadowScale = float.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.82],
  });
  const shadowOpacity = float.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.art}>
        {/* Soft background rings */}
        <View style={styles.ringOuter} />
        <View style={styles.ringInner} />

        {/* Sparkles */}
        <Animated.View
          style={[
            styles.sparkle,
            { top: 22, left: 34, width: 9, height: 9, opacity: sparkles[0] },
          ]}
        />
        <Animated.View
          style={[
            styles.sparkle,
            { top: 64, right: 26, width: 7, height: 7, opacity: sparkles[1] },
          ]}
        />
        <Animated.View
          style={[
            styles.sparkle,
            { top: 136, left: 24, width: 6, height: 6, opacity: sparkles[2] },
          ]}
        />

        {/* Shadow on the ground */}
        <Animated.View
          style={[
            styles.shadow,
            { opacity: shadowOpacity, transform: [{ scaleX: shadowScale }] },
          ]}
        />

        {/* The bucket */}
        <Animated.View
          style={[styles.bucket, { transform: [{ translateY: lift }] }]}
        >
          <View style={styles.handle} />
          <View style={styles.body} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>0</Text>
          </View>
          <View style={styles.rim} />
          <View style={styles.opening} />
        </Animated.View>
      </View>

      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {!!actionLabel && !!onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={styles.btnText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 16,
  },

  art: {
    width: 220,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  ringOuter: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: ORANGE,
    opacity: 0.07,
  },
  ringInner: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: ORANGE,
    opacity: 0.12,
  },
  sparkle: { position: "absolute", borderRadius: 6, backgroundColor: ORANGE },

  shadow: {
    position: "absolute",
    bottom: 4,
    width: 96,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(60,45,42,0.12)",
  },

  bucket: { position: "absolute", top: 22, width: 130, height: 140 },
  handle: {
    position: "absolute",
    top: 0,
    left: 17,
    width: 96,
    height: 48,
    borderWidth: 6,
    borderBottomWidth: 0,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    borderColor: DARK,
  },
  // Trapezoid: bottom edge 84 wide, top edge 84 + 16 + 16 = 116 wide.
  body: {
    position: "absolute",
    top: 48,
    left: 7,
    width: 115,
    height: 0,
    borderTopWidth: 92,
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderTopColor: ORANGE,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  badge: {
    position: "absolute",
    top: 82,
    left: 49,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 16, fontWeight: "900", color: DEEP },
  rim: {
    position: "absolute",
    top: 38,
    left: 3,
    width: 124,
    height: 22,
    borderRadius: 11,
    backgroundColor: DEEP,
  },
  opening: {
    position: "absolute",
    top: 43,
    left: 13,
    width: 104,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#6b3a12",
  },

  title: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#888",
    textAlign: "center",
  },
  btn: {
    marginTop: 20,
    paddingHorizontal: 28,
    height: 48,
    borderRadius: 16,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});

export default EmptyBucket;
