import CachedImage from "@/components/CachedImage";
import CartComponent from "@/components/CartComponent";
import HomePromos from "@/components/HomePromos";
import { images } from "@/constants/images";
import { updateUserAddress } from "@/lib/appwrite";
import { withProject } from "@/lib/homeContent";
import {
  useCategories,
  useMenu,
  usePickupLocations,
  usePromos,
} from "@/lib/queryClient";
import { useAddressStore } from "@/store/address.sore";
import useAuthStore from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// ---------------- DESIGN TOKENS ----------------
const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
const RADIUS = { sm: 8, md: 14, lg: 20, sheet: 28 };
const CARD_HEIGHT = 160;
const ORANGE = "#FF8F3A";
// The tab bar floats above the screen (~61px tall, 10px up), so lists need room under them.
const TAB_BAR_CLEARANCE = 110;

// Card colours used when a category has no `color` value in the database.
const FALLBACK_COLORS = ["#a57913", "#74633b", "#406e3b"];

const Homescreen = () => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();
  const { address, setAddress } = useAddressStore();

  // ---------------- CATEGORIES (cards) ----------------
  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();

  // Order the cards by the `sort_order` column when you set one.
  const sortedCategories = React.useMemo(
    () =>
      [...((categories ?? []) as any[])].sort(
        (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999),
      ),
    [categories],
  );

  // Banners from the `promos` table (the built-in ones show until you add some).
  const { data: promos, refetch: refetchPromos } = usePromos();

  // Pull down on the list to load your latest database changes right away.
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCategories(), refetchMenu(), refetchPromos()]);
    } finally {
      setRefreshing(false);
    }
  };

  // ---------------- MENU (feeds the offers and rails) ----------------
  const { data: menu, refetch: refetchMenu } = useMenu();

  // ---------------- ADDRESS ----------------
  // Follow the signed-in user, including clearing a previous user's address.
  React.useEffect(() => {
    setAddress(user?.address ?? "");
  }, [user?.$id, user?.address]);

  const handleSelectAddress = async (newAddress: string) => {
    const previous = address;
    setAddress(newAddress);
    if (!user?.$id) return;

    try {
      await updateUserAddress(user.$id, newAddress);
      setUser({ ...user, address: newAddress });
    } catch {
      setAddress(previous); // don't show a delivery point that wasn't saved
      Alert.alert(
        "Couldn't save your delivery point",
        "Check your connection and try again.",
      );
    }
  };

  // ---------------- LOCATIONS ----------------
  const { data: locationsData } = usePickupLocations();
  const locations = (locationsData ?? []) as any[];
  const [showLocations, setShowLocations] = React.useState(false);

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
  const renderCard = ({ item, index }: { item: any; index: number }) => {
    const isEven = index % 2 === 0;
    // Everything on the card comes from the categories table:
    // name, description, image_url and color.
    const image = withProject(item.image_url);
    const look = {
      image: image ? { uri: image } : null,
      color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    };
    const description = item.description;

    return (
      <Pressable
        // Opens the Search tab already filtered to this category.
        onPress={() =>
          router.navigate({
            pathname: "/(tabs)/SearchScreen",
            params: { category: item.$id },
          } as any)
        }
        android_ripple={{ color: "#ffffff22" }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: look.color,
            flexDirection: isEven ? "row" : "row-reverse",
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={styles.cardImageWrap}>
          {look.image ? (
            <CachedImage
              source={look.image}
              resizeMode="contain"
              style={styles.cardImage}
            />
          ) : (
            // No image_url yet: a neutral icon instead of someone else's picture.
            <Ionicons
              name="fast-food-outline"
              size={64}
              color="rgba(255,255,255,0.55)"
            />
          )}
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
            {item.name}
          </Text>

          {!!description && (
            <Text
              style={[
                styles.cardDesc,
                { textAlign: isEven ? "left" : "right" },
              ]}
              numberOfLines={2}
            >
              {description}
            </Text>
          )}

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
              // navigate() switches to the Profile tab instead of stacking a copy of it.
              onPress={() => router.navigate("/(tabs)/ProfileScreen")}
              activeOpacity={0.8}
            >
              <Image
                source={user?.avatar ? { uri: user.avatar } : images.userImage}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ---------------- CATEGORY CARDS ---------------- */}
        <FlatList
          style={styles.list}
          data={sortedCategories}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(item) => item.$id}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              <HomePromos
                items={(menu ?? []) as any[]}
                promos={(promos ?? []) as any[]}
              />
              <Text style={styles.sectionTitle}>Browse categories</Text>
            </View>
          }
          ListEmptyComponent={
            categoriesLoading ? (
              <ActivityIndicator
                size="large"
                color={ORANGE}
                style={{ marginTop: SPACING.xl * 2 }}
              />
            ) : (
              <Text style={styles.emptyText}>No categories yet</Text>
            )
          }
        />

        {/* ---------------- PICKUP SHEET ---------------- */}
        {/* A Modal draws above the floating tab bar and closes with the Android back button. */}
        <Modal
          visible={showLocations}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={closeSheet}
        >
          <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />

            <Animated.View
              style={[
                styles.sheet,
                {
                  transform: [{ translateY }],
                  maxHeight: height * 0.65,
                  paddingBottom: Math.max(insets.bottom, SPACING.md),
                },
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
                contentContainerStyle={{ paddingBottom: SPACING.lg }}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    No pickup points available yet
                  </Text>
                }
                renderItem={({ item: loc }) => {
                  const selected = loc.address === address;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        handleSelectAddress(loc.address);
                        closeSheet();
                      }}
                      style={[
                        styles.locationItem,
                        selected && styles.locationItemSelected,
                      ]}
                    >
                      <View style={{ flex: 1, gap: SPACING.xs }}>
                        <Text style={styles.locationName}>{loc.name}</Text>
                        <Text style={styles.locationAddress}>
                          {loc.address}
                        </Text>
                      </View>
                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={ORANGE}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </Animated.View>
          </View>
        </Modal>
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
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    marginTop: SPACING.xl,
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
    flex: 1,
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
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: "#f7f7f7",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  locationItemSelected: {
    borderColor: ORANGE,
    backgroundColor: "#FF8F3A14",
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
