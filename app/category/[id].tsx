import EmptyBucket from "@/components/EmptyBucket";
import { images } from "@/constants/images";
import { appwriteConfig } from "@/lib/appwrite";
import CachedImage from "@/lib/CachedImage";
import { fmt } from "@/lib/cartMath";
import { withProject } from "@/lib/homeContent";
import { useCategories, useMenu } from "@/lib/queryClient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORANGE = "#FF8F3A";
const SIDE = 16;
const GAP = 12;

const itemImage = (it: any) =>
  `${it.image_url}?project=${appwriteConfig.projectId}`;

const CategoryScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const cardW = (width - SIDE * 2 - GAP) / 2;

  // Both come from the shared cache, so opening this screen is instant after the home screen.
  const { data: categories } = useCategories();
  const category = ((categories ?? []) as any[]).find((c) => c.$id === id);
  const { data: menu, isLoading, refetch } = useMenu(id ?? "", "");
  const items = (menu ?? []) as any[];

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const color = category?.color || "#3B2D2A";
  const heroImage = withProject(category?.image_url);

  const hero = (
    <View style={[styles.hero, { backgroundColor: color }]}>
      <View style={styles.heroText}>
        <Text style={styles.heroTitle} numberOfLines={2}>
          {category?.name ?? "Menu"}
        </Text>
        {!!category?.description && (
          <Text style={styles.heroDesc} numberOfLines={3}>
            {category.description}
          </Text>
        )}
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {isLoading
              ? "Loading..."
              : `${items.length} item${items.length === 1 ? "" : "s"}`}
          </Text>
        </View>
      </View>
      {!!heroImage && (
        <CachedImage
          source={{ uri: heroImage }}
          style={styles.heroImg}
          resizeMode="contain"
        />
      )}
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const hasDeal = Number(item.old_price) > Number(item.price);
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/product/[id]",
            params: { id: item.$id },
          } as any)
        }
        style={({ pressed }) => [
          styles.card,
          { width: cardW, opacity: pressed ? 0.92 : 1 },
        ]}
      >
        <CachedImage
          source={{ uri: itemImage(item) }}
          style={styles.cardImg}
          resizeMode="contain"
        />
        <Text style={styles.cardName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.cardPrice}>Ksh.{fmt(Number(item.price))}</Text>
            {hasDeal && (
              <Text style={styles.cardOld}>
                Ksh.{fmt(Number(item.old_price))}
              </Text>
            )}
          </View>
          {!!item.rating && (
            <Text style={styles.cardRating}>★ {item.rating}</Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.page} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Image
            source={images.arrowBack}
            style={styles.back}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {category?.name ?? "Menu"}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {isLoading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.$id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ gap: GAP }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={styles.list}
          ListHeaderComponent={hero}
          ListEmptyComponent={
            <EmptyBucket
              title={`Nothing in ${category?.name ?? "this category"} yet`}
              subtitle="New dishes are on the way. Check back soon."
              actionLabel="Back to menu"
              onAction={() => router.back()}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f6f6f6" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  back: { width: 22, height: 22 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
    marginHorizontal: 12,
  },

  list: { paddingHorizontal: SIDE, paddingBottom: 40, gap: GAP },

  hero: {
    height: 140,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    overflow: "hidden",
    marginBottom: 6,
  },
  heroText: { flex: 1, gap: 6, zIndex: 2 },
  heroTitle: { fontSize: 24, fontWeight: "800", color: "#fff", lineHeight: 30 },
  heroDesc: { fontSize: 12, lineHeight: 17, color: "rgba(255,255,255,0.88)" },
  countPill: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 12,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  countText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  heroImg: { width: 140, height: 140, marginRight: -16 },

  card: {
    padding: 10,
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardImg: { width: "100%", height: 100 },
  cardName: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    minHeight: 36,
  },
  cardBottom: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  cardPrice: { fontSize: 14, fontWeight: "800", color: ORANGE },
  cardOld: { fontSize: 11, color: "#aaa", textDecorationLine: "line-through" },
  cardRating: { fontSize: 12, fontWeight: "700", color: "#a95a14" },
});

export default CategoryScreen;
