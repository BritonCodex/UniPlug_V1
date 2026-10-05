import { images } from "@/constants/images";
import { appwriteConfig } from "@/lib/appwrite";
import { getCustomizations, getMenuItem, pickOptions } from "@/lib/menu";
import { useCartStore } from "@/store/cart.store";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const ORANGE = "#FF8F3A";
const DARK = "#3B2D2A";
const RED = "#D6294B";

// Used when a customization has no image_url of its own.
const EMOJI: Record<string, string> = {
  "Extra Cheese": "🧀",
  Jalapeños: "🌶️",
  Onions: "🧅",
  Olives: "🫒",
  Mushrooms: "🍄",
  Tomatoes: "🍅",
  Bacon: "🥓",
  Avocado: "🥑",
  Coke: "🥤",
  Fries: "🍟",
  "Garlic Bread": "🥖",
  "Chicken Nuggets": "🍗",
  "Iced Tea": "🧋",
  Salad: "🥗",
  "Potato Wedges": "🥔",
  "Mozzarella Sticks": "🧀",
  "Sweet Corn": "🌽",
  "Choco Lava Cake": "🍫",
};

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

type Option = {
  $id: string;
  name: string;
  price: number;
  type: string;
  image_url?: string;
};

const OptionCard = ({
  option,
  selected,
  onPress,
}: {
  option: Option;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.optionCard, selected && { borderColor: ORANGE }]}
  >
    <View style={styles.optionTop}>
      {option.image_url ? (
        <Image
          source={{ uri: option.image_url }}
          style={styles.optionImg}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.optionEmoji}>{EMOJI[option.name] ?? "🍽️"}</Text>
      )}
      <Text style={styles.optionPrice}>Ksh.{fmt(option.price)}</Text>
    </View>
    <View style={styles.optionBottom}>
      <Text style={styles.optionName} numberOfLines={1}>
        {option.name}
      </Text>
      <View style={[styles.plus, selected && { backgroundColor: "#2ecc71" }]}>
        <Text style={styles.plusText}>{selected ? "✓" : "+"}</Text>
      </View>
    </View>
  </Pressable>
);

const ProductDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { addItem } = useCartStore() as any; // assumed signature: addItem({ id, name, price, image_url, customizations })

  const [item, setItem] = React.useState<any>(null);
  const [options, setOptions] = React.useState<Option[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [qty, setQty] = React.useState(1);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [menuItem, allCustomizations] = await Promise.all([
          getMenuItem(id),
          getCustomizations(),
        ]);
        if (!alive) return;

        setItem(menuItem);
        setOptions(pickOptions(menuItem, allCustomizations) as any);
      } catch {
        if (alive)
          setError(
            "Couldn't load this item. Check your connection and try again.",
          );
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const toggle = (optId: string) =>
    setSelectedIds((cur) =>
      cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId],
    );

  // Same URL format the menu card uses, so the image loads and the cart gets the same one.
  const imageUrl = item
    ? `${item.image_url}?project=${appwriteConfig.projectId}`
    : "";

  const selected = options.filter((o) => selectedIds.includes(o.$id));
  const unitPrice =
    (item?.price ?? 0) + selected.reduce((s, o) => s + o.price, 0);
  const total = unitPrice * qty;

  const handleAdd = () => {
    const customizations = selected.map((o) => ({
      id: o.$id,
      name: o.name,
      price: o.price,
      type: o.type,
    }));
    // Base price only: the cart adds customization prices itself.
    for (let i = 0; i < qty; i++) {
      addItem({
        id: item.$id,
        name: item.name,
        price: item.price,
        image_url: imageUrl,
        customizations,
      });
    }
    router.back();
  };

  const header = (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
        <Image
          source={images.arrowBack}
          style={styles.headerIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={{ width: 22 }} />
    </View>
  );

  if (error || !item) {
    return (
      <SafeAreaView style={styles.page}>
        <Stack.Screen options={{ headerShown: false }} />
        {header}
        <View style={styles.center}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <ActivityIndicator size="large" color={ORANGE} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const typeOf = (o: Option) => String(o.type).toLowerCase();
  const toppings = options.filter((o) => typeOf(o) === "topping");
  const sides = options.filter((o) => typeOf(o) === "side");
  const heroImg = width * 0.62;
  const stars = Math.round(item.rating ?? 0);

  return (
    <SafeAreaView style={styles.page} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      {header}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Hero: text on the left, image bleeding off the right edge */}
        <View style={[styles.hero, { minHeight: heroImg }]}>
          <View style={styles.heroText}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.category}>{item.category_name}</Text>

            <View style={styles.starsRow}>
              <Text style={styles.stars}>
                {"★".repeat(stars)}
                <Text style={{ color: "#ddd" }}>{"★".repeat(5 - stars)}</Text>
              </Text>
              <Text style={styles.rating}>{item.rating}/5</Text>
            </View>

            <Text style={styles.price}>
              <Text style={{ fontSize: 16 }}>Ksh.</Text>
              {fmt(item.price)}
            </Text>

            <View style={styles.stats}>
              <View>
                <Text style={styles.statLabel}>Calories</Text>
                <Text style={styles.statValue}>{item.calories} Cal</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Protein</Text>
                <Text style={styles.statValue}>{item.protein}g</Text>
              </View>
            </View>
          </View>

          <Image
            source={{ uri: imageUrl }}
            resizeMode="contain"
            style={[
              styles.heroImage,
              { width: heroImg, height: heroImg, right: -width * 0.14 },
            ]}
          />
        </View>

        {/* Info pill */}
        <View style={styles.pill}>
          <View style={styles.pillItem}>
            <View style={styles.pillDot}>
              <Text style={styles.pillDotText}>$</Text>
            </View>
            <Text style={styles.pillText}>Free Delivery</Text>
          </View>
          <View style={styles.pillItem}>
            <View style={styles.pillDot}>
              <Text style={styles.pillDotText}>◔</Text>
            </View>
            <Text style={styles.pillText}>20 - 30 mins</Text>
          </View>
          <View style={styles.pillItem}>
            <Text style={{ color: ORANGE }}>★</Text>
            <Text style={styles.pillText}>{item.rating}</Text>
          </View>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        {toppings.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Toppings</Text>
            <FlatList
              horizontal
              data={toppings}
              keyExtractor={(o) => o.$id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.optionList}
              renderItem={({ item: o }) => (
                <OptionCard
                  option={o}
                  selected={selectedIds.includes(o.$id)}
                  onPress={() => toggle(o.$id)}
                />
              )}
            />
          </>
        )}

        {sides.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Side options</Text>
            <FlatList
              horizontal
              data={sides}
              keyExtractor={(o) => o.$id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.optionList}
              renderItem={({ item: o }) => (
                <OptionCard
                  option={o}
                  selected={selectedIds.includes(o.$id)}
                  onPress={() => toggle(o.$id)}
                />
              )}
            />
          </>
        )}
      </ScrollView>

      {/* Sticky add-to-cart bar */}
      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        <View style={styles.qtyBox}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Text style={styles.qtyBtnText}>–</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQty((q) => q + 1)}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => [
            styles.addBtn,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.addText}>Add to cart · Ksh.{fmt(total)}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: { color: "#c0392b", textAlign: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerIcon: { width: 22, height: 22 },

  hero: { paddingLeft: 20, overflow: "hidden" },
  heroText: { width: "52%", gap: 10, zIndex: 2 },
  heroImage: { position: "absolute", top: 0 },
  title: { fontSize: 26, fontWeight: "800", color: "#111", lineHeight: 32 },
  category: { fontSize: 16, color: "#9a9a9a" },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stars: { color: ORANGE, fontSize: 16, letterSpacing: 1 },
  rating: { fontSize: 13, color: "#555", fontWeight: "600" },
  price: { fontSize: 26, fontWeight: "800", color: ORANGE },
  stats: { flexDirection: "row", gap: 24, marginTop: 4 },
  statLabel: { fontSize: 12, color: "#9a9a9a" },
  statValue: { fontSize: 14, fontWeight: "700", color: "#222", marginTop: 2 },

  pill: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pillItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  pillDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  pillDotText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  pillText: { fontSize: 13, fontWeight: "600", color: "#333" },

  description: {
    marginHorizontal: 20,
    marginTop: 20,
    fontSize: 15,
    lineHeight: 24,
    color: "#666",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  optionList: { paddingHorizontal: 20, gap: 14, paddingBottom: 6 },
  optionCard: {
    width: 84,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  optionTop: {
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  optionEmoji: { fontSize: 34 },
  optionImg: { width: 44, height: 44 },
  optionPrice: { fontSize: 10, color: "#777", fontWeight: "600" },
  optionBottom: {
    height: 34,
    backgroundColor: DARK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    gap: 4,
  },
  optionName: { flex: 1, fontSize: 11, fontWeight: "700", color: "#fff" },
  plus: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: { color: "#fff", fontSize: 12, fontWeight: "800", lineHeight: 14 },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  qtyBox: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#9c9c9c22",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 18, fontWeight: "700", color: "#222" },
  qtyText: {
    minWidth: 20,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
  addBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});

export default ProductDetails;
