import CartComponent from "@/components/CartComponent";
import { image_layout, images } from "@/constants/images";
import { getPickupLocations, updateUserAddress } from "@/lib/appwrite";
import { useAddressStore } from "@/store/address.sore";
import useAuthStore from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Animated,
  FlatList,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ---------------- DESIGN TOKENS ----------------
const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
const RADIUS = { sm: 8, md: 14, lg: 20, sheet: 28 };
const CARD_HEIGHT = 160;

const Homescreen = () => {
  const { width, height } = useWindowDimensions();
  const { user, setUser } = useAuthStore();
  const { address, setAddress } = useAddressStore();

  // ---------------- ADDRESS ----------------
  React.useEffect(() => {
    if (user?.address) setAddress(user.address);
  }, [user]);

  const handleSelectAddress = async (newAddress: string) => {
    setAddress(newAddress);

    if (user?.$id) {
      await updateUserAddress(user.$id, newAddress);
      setUser({ ...user, address: newAddress });
    }
  };

  // ---------------- LOCATIONS ----------------
  const [locations, setLocations] = React.useState<any[]>([]);
  const [showLocations, setShowLocations] = React.useState(false);

  React.useEffect(() => {
    const loadLocations = async () => {
      const data = await getPickupLocations();
      setLocations(data);
    };
    loadLocations();
  }, []);

  // ---------------- SHEET ANIMATION ----------------
  const translateY = React.useRef(new Animated.Value(height)).current;

  const openSheet = () => {
    setShowLocations(true);
    requestAnimationFrame(() => {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    });
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowLocations(false);
      translateY.setValue(height);
    });
  };

  // Drag handler is attached to the handle area only, so the list
  // inside the sheet can scroll without fighting the gesture.
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // ---------------- RENDER HELPERS ----------------
  const renderCard = ({
    item,
    index,
  }: {
    item: (typeof image_layout)[number];
    index: number;
  }) => {
    const isEven = index % 2 === 0;

    return (
      <Pressable
        android_ripple={{ color: "#ffffff22" }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: item.color,
            flexDirection: isEven ? "row" : "row-reverse",
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={styles.cardImageWrap}>
          <Image
            source={item.image}
            resizeMode="contain"
            style={styles.cardImage}
          />
        </View>

        <View
          style={[
            styles.cardContent,
            { alignItems: isEven ? "flex-start" : "flex-end" },
          ]}
        >
          <Text
            style={[styles.cardTitle, { textAlign: isEven ? "left" : "right" }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <Text
            style={[styles.cardDesc, { textAlign: isEven ? "left" : "right" }]}
            numberOfLines={2}
          >
            {item.desc}
          </Text>

          <View style={styles.arrowChip}>
            <Image
              source={images.arrowRight}
              resizeMode="contain"
              style={styles.arrowIcon}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.pageContainer} edges={["top"]}>
      <View style={styles.container}>
        {/* ---------------- HEADER ---------------- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerLabel}>DELIVERY POINT</Text>

            <TouchableOpacity
              style={styles.addressRow}
              onPress={openSheet}
              activeOpacity={0.7}
            >
              <Text style={styles.addressText} numberOfLines={1}>
                {address || "Set delivery address"}
              </Text>
              <Image
                source={images.arrowDown}
                resizeMode="contain"
                style={styles.addressChevron}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.headerRight}>
            <CartComponent />

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/ProfileScreen")}
              activeOpacity={0.8}
            >
              <Image
                source={user?.avatar ? { uri: user.avatar } : images.userImage}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------------- MENU LIST ---------------- */}
        <FlatList
          style={styles.list}
          data={image_layout}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          contentContainerStyle={styles.listContent}
        />

        {/* ---------------- PICKUP SHEET ---------------- */}
        {showLocations && (
          <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />

            <Animated.View
              style={[
                styles.sheet,
                { transform: [{ translateY }], maxHeight: height * 0.65 },
              ]}
            >
              <View
                {...panResponder.panHandlers}
                style={styles.sheetHandleArea}
              >
                <View style={styles.sheetHandle} />
              </View>

              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Select pickup point</Text>
                <TouchableOpacity onPress={closeSheet} hitSlop={12}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={locations}
                keyExtractor={(item) => item.$id}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => (
                  <View style={{ height: SPACING.sm }} />
                )}
                contentContainerStyle={{ paddingBottom: SPACING.xl }}
                renderItem={({ item: loc }) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      handleSelectAddress(loc.address);
                      closeSheet();
                    }}
                    style={styles.locationItem}
                  >
                    <Text style={styles.locationName}>{loc.name}</Text>
                    <Text style={styles.locationAddress}>{loc.address}</Text>
                  </TouchableOpacity>
                )}
              />
            </Animated.View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: "#9c9c9c22",
    borderRadius: RADIUS.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
    gap: SPACING.xs,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  addressText: {
    flexShrink: 1,
    fontSize: 12,
    color: "#444",
  },
  addressChevron: {
    width: 12,
    height: 12,
    tintColor: "#000",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e5e5",
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  // Card
  card: {
    height: CARD_HEIGHT,
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  cardImageWrap: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    gap: SPACING.sm,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 26,
    color: "#fff",
    fontFamily: "PlayfairDisplay-Bold",
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "PlayfairDisplay-Regular",
    letterSpacing: 0.2,
  },
  arrowChip: {
    width: 50,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff33",
  },
  arrowIcon: {
    width: 40,
    height: 30,
    tintColor: "#fff",
  },

  // Sheet
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    paddingHorizontal: SPACING.xl,
  },
  sheetHandleArea: {
    alignItems: "center",
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  sheetHandle: {
    width: 45,
    height: 5,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  locationItem: {
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: "#f7f7f7",
    gap: SPACING.xs,
  },
  locationName: {
    fontWeight: "600",
  },
  locationAddress: {
    fontSize: 12,
    color: "#666",
  },
});

export default Homescreen;
