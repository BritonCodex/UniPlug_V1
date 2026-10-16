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
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

// Empty-cart illustration drawn with plain Views (no SVG package needed):
// a little orange shopping cart that rocks gently, with a "0" bubble,
// a soft shadow, twinkling sparkles and a message below.
const EmptyCart = ({
  title = "Your cart is empty",
  subtitle = "Looks like you haven't added anything yet. Pick something tasty!",
  actionLabel,
  onAction,
}: Props) => {
  const sway = React.useRef(new Animated.Value(0)).current;
  const sparkles = React.useRef(
    [0, 1, 2].map(() => new Animated.Value(0.2)),
  ).current;

  React.useEffect(() => {
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const sparkleLoops = sparkles.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 450),
          Animated.timing(v, {
            toValue: 1,
            duration: 850,
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0.2,
            duration: 850,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    swayLoop.start();
    sparkleLoops.forEach((l) => l.start());
    return () => {
      swayLoop.stop();
      sparkleLoops.forEach((l) => l.stop());
    };
  }, [sway, sparkles]);

  const moveX = sway.interpolate({ inputRange: [0, 1], outputRange: [-8, 8] });
  const tilt = sway.interpolate({
    inputRange: [0, 1],
    outputRange: ["-3deg", "3deg"],
  });
  const shadowX = sway.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 8],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.art}>
        <View style={styles.ringOuter} />
        <View style={styles.ringInner} />

        <Animated.View
          style={[
            styles.sparkle,
            { top: 24, right: 34, width: 9, height: 9, opacity: sparkles[0] },
          ]}
        />
        <Animated.View
          style={[
            styles.sparkle,
            { top: 70, left: 22, width: 7, height: 7, opacity: sparkles[1] },
          ]}
        />
        <Animated.View
          style={[
            styles.sparkle,
            { top: 138, right: 24, width: 6, height: 6, opacity: sparkles[2] },
          ]}
        />

        <Animated.View
          style={[styles.shadow, { transform: [{ translateX: shadowX }] }]}
        />

        <Animated.View
          style={[
            styles.cart,
            { transform: [{ translateX: moveX }, { rotate: tilt }] },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleBar} />
          <View style={styles.handleStem} />

          {/* Basket: trapezoid, 78 wide at the bottom and 112 at the top */}
          <View style={styles.basket} />
          <View style={[styles.slat, { left: 62 }]} />
          <View style={[styles.slat, { left: 87 }]} />
          <View style={[styles.slat, { left: 112 }]} />
          <View style={styles.rim} />

          {/* Wheels */}
          <View style={[styles.wheel, { left: 54 }]}>
            <View style={styles.hub} />
          </View>
          <View style={[styles.wheel, { left: 102 }]}>
            <View style={styles.hub} />
          </View>

          {/* Zero bubble */}
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>0</Text>
          </View>
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
    bottom: 14,
    width: 110,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(60,45,42,0.12)",
  },

  cart: { position: "absolute", top: 40, width: 160, height: 124 },

  handleBar: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: DARK,
  },
  handleStem: {
    position: "absolute",
    top: 22,
    left: 16,
    width: 30,
    height: 6,
    borderRadius: 3,
    backgroundColor: DARK,
    transform: [{ rotate: "60deg" }],
  },

  basket: {
    position: "absolute",
    top: 44,
    left: 33,
    width: 78,
    height: 0,
    borderTopWidth: 54,
    borderLeftWidth: 17,
    borderRightWidth: 17,
    borderTopColor: ORANGE,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  slat: {
    position: "absolute",
    top: 54,
    width: 3,
    height: 36,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  rim: {
    position: "absolute",
    top: 34,
    left: 30,
    width: 118,
    height: 12,
    borderRadius: 6,
    backgroundColor: DEEP,
  },

  wheel: {
    position: "absolute",
    top: 102,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: DARK,
    alignItems: "center",
    justifyContent: "center",
  },
  hub: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" },

  bubble: {
    position: "absolute",
    top: 20,
    left: 132,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#e74c3c",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleText: { color: "#fff", fontSize: 12, fontWeight: "900" },

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

export default EmptyCart;
