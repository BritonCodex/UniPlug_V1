import { appwriteConfig } from "@/lib/appwrite";
import CachedImage from "@/lib/CachedImage";
import { fmt } from "@/lib/cartMath";
import { Promo, withProject } from "@/lib/homeContent";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const ORANGE = "#FF8F3A";
const DARK = "#3B2D2A";
const SIDE = 5; // must match the home list's horizontal padding
const SPICY = /spic|bbq|jalape|pepperoni|tikka|masala/i;

const imageUrl = (it: any) =>
  `${it.image_url}?project=${appwriteConfig.projectId}`;
const openItem = (id?: string) =>
  id
    ? router.push({ pathname: "/product/[id]", params: { id } } as any)
    : router.navigate("/(tabs)/SearchScreen" as any);

const openBanner = (b: { itemId?: string; categoryId?: string }) => {
  if (b.itemId) return openItem(b.itemId);
  if (b.categoryId) {
    return router.navigate({
      pathname: "/(tabs)/SearchScreen",
      params: { category: b.categoryId },
    } as any);
  }
  return router.navigate("/(tabs)/SearchScreen" as any);
};

type Banner = {
  key: string;
  title: string;
  subtitle: string;
  color: string;
  itemId?: string;
  categoryId?: string;
  image?: string;
};

// ---- A small food card used in the rails -------------------------------------------------
const MiniCard = ({ item }: { item: any }) => {
  const hasDeal = Number(item.old_price) > Number(item.price);
  return (
    <Pressable
      onPress={() => openItem(item.$id)}
      style={({ pressed }) => [styles.mini, { opacity: pressed ? 0.92 : 1 }]}
    >
      <CachedImage
        source={{ uri: imageUrl(item) }}
        style={styles.miniImg}
        resizeMode="contain"
      />
      <Text style={styles.miniName} numberOfLines={2}>
        {item.name}
      </Text>
      <View style={styles.miniBottom}>
        <View>
          <Text style={styles.miniPrice}>Ksh.{fmt(Number(item.price))}</Text>
          {hasDeal && (
            <Text style={styles.miniOld}>
              Ksh.{fmt(Number(item.old_price))}
            </Text>
          )}
        </View>
        {!!item.rating && (
          <Text style={styles.miniRating}>★ {item.rating}</Text>
        )}
      </View>
      {hasDeal && (
        <View style={styles.dealBadge}>
          <Text style={styles.dealBadgeText}>
            -
            {Math.round(
              (1 - Number(item.price) / Number(item.old_price)) * 100,
            )}
            %
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const Rail = ({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: any[];
}) => {
  if (items.length === 0) return null;
  return (
    <View style={styles.railWrap}>
      <View style={styles.railHead}>
        <Text style={styles.railTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.railSub}>{subtitle}</Text>}
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(it) => it.$id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railList}
        renderItem={({ item }) => <MiniCard item={item} />}
      />
    </View>
  );
};

// ---- The whole promo block: banner carousel + rails -----------------------------------------
const HomePromos = ({
  items,
  promos = [],
}: {
  items: any[];
  promos?: Promo[];
}) => {
  const { width } = useWindowDimensions();
  const bannerW = width - SIDE * 2 - 28; // leave a peek of the next banner

  const { banners, topRated, deals, spicy, isWeekend } = React.useMemo(() => {
    const day = new Date().getDay(); // 0 Sun ... 6 Sat
    const weekend = day === 5 || day === 6 || day === 0;
    const sato = day === 6;

    const top = [...items]
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      .slice(0, 8);
    const dealItems = items
      .filter((i) => Number(i.old_price) > Number(i.price))
      .slice(0, 8);
    const spicyItems = items
      .filter((i) => SPICY.test(`${i.name} ${i.description ?? ""}`))
      .slice(0, 8);

    const list: Banner[] = [];
    if (sato) {
      const pick = spicyItems[0] ?? top[0];
      list.push({
        key: "sato",
        title: "Hot Sato 🔥",
        subtitle: "Saturday cravings, sorted. Order in a tap.",
        color: "#d9480f",
        itemId: pick?.$id,
        image: pick && imageUrl(pick),
      });
    } else if (weekend) {
      const pick = spicyItems[0] ?? top[0];
      list.push({
        key: "weekend",
        title: "Spice up your weekend 🌶️",
        subtitle: "Our spiciest picks, delivered to you.",
        color: "#b83227",
        itemId: pick?.$id,
        image: pick && imageUrl(pick),
      });
    }
    if (dealItems.length) {
      const pick = dealItems[0];
      list.push({
        key: "deals",
        title: "Hot Deals",
        subtitle: `Save on ${dealItems.length} item${dealItems.length > 1 ? "s" : ""} today`,
        color: ORANGE,
        itemId: pick.$id,
        image: imageUrl(pick),
      });
    }
    if (top.length) {
      const pick = top[0];
      list.push({
        key: "comrade",
        title: "Comrade's Choice",
        subtitle: "Student favourites, top rated.",
        color: DARK,
        itemId: pick.$id,
        image: imageUrl(pick),
      });
    }
    // Banners you create in the `promos` table replace the built-in ones.
    const fromDb: Banner[] = promos.map((p) => ({
      key: p.$id,
      title: p.title,
      subtitle: p.subtitle ?? "",
      color: p.color || ORANGE,
      itemId: p.menu_item_id || undefined,
      categoryId: p.category_id || undefined,
      image: withProject(p.image_url),
    }));

    return {
      banners: fromDb.length > 0 ? fromDb : list,
      topRated: top,
      deals: dealItems,
      spicy: spicyItems,
      isWeekend: weekend,
    };
  }, [items, promos]);

  if (items.length === 0) return null;

  return (
    <View style={styles.bleed}>
      {/* Banner carousel */}
      {banners.length > 0 && (
        <FlatList
          horizontal
          data={banners}
          keyExtractor={(b) => b.key}
          showsHorizontalScrollIndicator={false}
          snapToInterval={bannerW + 12}
          decelerationRate="fast"
          contentContainerStyle={styles.bannerList}
          renderItem={({ item: b }) => (
            <Pressable
              onPress={() => openItem(b.itemId)}
              style={({ pressed }) => [
                styles.banner,
                {
                  width: bannerW,
                  backgroundColor: b.color,
                  opacity: pressed ? 0.94 : 1,
                },
              ]}
            >
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>{b.title}</Text>
                <Text style={styles.bannerSub}>{b.subtitle}</Text>
                <View style={styles.bannerPill}>
                  <Text style={styles.bannerPillText}>Order now ›</Text>
                </View>
              </View>
              {!!b.image && (
                <CachedImage
                  source={{ uri: b.image }}
                  style={styles.bannerImg}
                  resizeMode="contain"
                />
              )}
            </Pressable>
          )}
        />
      )}

      {/* Rails */}
      <Rail
        title="Comrade's Choice"
        subtitle="Top rated by students"
        items={topRated}
      />
      <Rail
        title="Hot Deals 🔥"
        subtitle="Prices cut for a limited time"
        items={deals}
      />
      {isWeekend && (
        <Rail
          title="Spice up your weekend 🌶️"
          subtitle="Bring the heat"
          items={spicy}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Lets the carousels run edge to edge inside the padded list.
  bleed: { marginHorizontal: -SIDE, marginBottom: 8 },

  bannerList: { paddingHorizontal: SIDE, gap: 12 },
  banner: {
    height: 132,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    overflow: "hidden",
  },
  bannerText: { flex: 1, gap: 6, paddingRight: 4, zIndex: 2 },
  bannerTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 24,
  },
  bannerSub: { fontSize: 12, lineHeight: 16, color: "rgba(255,255,255,0.88)" },
  bannerPill: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerPillText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  bannerImg: { width: 128, height: 128, marginRight: -14 },

  railWrap: { marginTop: 22 },
  railHead: { paddingHorizontal: SIDE, marginBottom: 10 },
  railTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
  railSub: { fontSize: 12, color: "#888", marginTop: 2 },
  railList: { paddingHorizontal: SIDE, gap: 12, paddingBottom: 6 },

  mini: {
    width: 142,
    padding: 10,
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  miniImg: { width: "100%", height: 92 },
  miniName: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
    minHeight: 34,
  },
  miniBottom: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  miniPrice: { fontSize: 13, fontWeight: "800", color: ORANGE },
  miniOld: { fontSize: 11, color: "#aaa", textDecorationLine: "line-through" },
  miniRating: { fontSize: 11, fontWeight: "700", color: "#a95a14" },
  dealBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dealBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
});

export default HomePromos;
