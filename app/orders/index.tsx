import EmptyBucket from "@/components/EmptyBucket";
import { HOME_ROUTE } from "@/constants/routes";
import { fmt } from "@/lib/cartMath";
import { getMyOrders, isFailedStatus, stepIndexForStatus } from "@/lib/orders";
import useAuthStore from "@/store/auth.store";
import { Stack, router, useFocusEffect } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORANGE = "#FF8F3A";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  verified: "Confirmed",
  processing: "Preparing",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

const chipColors = (status: string) => {
  if (isFailedStatus(status)) return { bg: "#e74c3c22", fg: "#c0392b" };
  const step = stepIndexForStatus(status);
  if (step === 3) return { bg: "#2ecc7122", fg: "#1e8449" };
  if (step === 2) return { bg: "#3498db22", fg: "#1f6fa8" };
  return { bg: "#FF8F3A22", fg: "#a95a14" };
};

const summarize = (items: any[]) => {
  if (!items.length) return "Order details unavailable";
  const first = items
    .slice(0, 2)
    .map((it) => `${it.quantity ?? 1} × ${it.name}`)
    .join(", ");
  return items.length > 2 ? `${first} +${items.length - 2} more` : first;
};

const OrdersScreen = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [tab, setTab] = React.useState<"active" | "past">("active");

  const load = React.useCallback(async () => {
    if (!user?.$id) {
      setLoading(false);
      return;
    }
    try {
      setOrders(await getMyOrders(user.$id));
      setError("");
    } catch {
      setError("Couldn't load your orders. Pull down to try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.$id]);

  // Refresh every time the screen comes back into view (e.g. after viewing an order).
  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load]),
  );

  const isPast = (o: any) =>
    stepIndexForStatus(o.status) === 3 || isFailedStatus(o.status);
  const visible = orders.filter((o) =>
    tab === "past" ? isPast(o) : !isPast(o),
  );

  const renderOrder = ({ item: o }: { item: any }) => {
    const colors = chipColors(o.status);
    const label = STATUS_LABEL[String(o.status).toLowerCase()] ?? o.status;
    return (
      <Pressable
        onPress={() =>
          router.push({ pathname: "/order/[id]", params: { id: o.$id } })
        }
        style={({ pressed }) => [styles.card, { opacity: pressed ? 0.92 : 1 }]}
      >
        <View style={styles.cardTop}>
          <Text style={styles.orderNo}>
            #{String(o.$id).slice(-6).toUpperCase()}
          </Text>
          <View style={[styles.chip, { backgroundColor: colors.bg }]}>
            <Text style={[styles.chipText, { color: colors.fg }]}>{label}</Text>
          </View>
        </View>

        <View style={styles.itemsRow}>
          <View style={styles.thumbs}>
            {o.items.slice(0, 3).map((it: any, i: number) =>
              it.image_url ? (
                <Image
                  key={`${it.id}-${i}`}
                  source={{ uri: it.image_url }}
                  style={[styles.thumb, i > 0 && styles.thumbOverlap]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  key={`${it.id}-${i}`}
                  style={[
                    styles.thumb,
                    styles.thumbEmpty,
                    i > 0 && styles.thumbOverlap,
                  ]}
                >
                  <Text>🍽️</Text>
                </View>
              ),
            )}
            {o.items.length > 3 && (
              <View
                style={[styles.thumb, styles.thumbEmpty, styles.thumbOverlap]}
              >
                <Text style={styles.thumbMore}>+{o.items.length - 3}</Text>
              </View>
            )}
          </View>

          <Text style={styles.items} numberOfLines={3}>
            {summarize(o.items)}
          </Text>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.date}>
            {new Date(o.$createdAt).toLocaleString()}
          </Text>
          <Text style={styles.total}>Ksh.{fmt(o.totalPrice)}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.page} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        {(["active", "past"] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabOn]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
              {t === "active" ? "Active" : "Past"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(o) => o.$id}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            error ? (
              <EmptyBucket
                title="Couldn't load your orders"
                subtitle={error}
                actionLabel="Try again"
                onAction={() => {
                  setLoading(true);
                  load();
                }}
              />
            ) : tab === "active" ? (
              <EmptyBucket
                title="No active orders"
                subtitle="Your bucket's empty. Orders you place will show up here."
                actionLabel="Browse menu"
                onAction={() => router.replace(HOME_ROUTE as any)}
              />
            ) : (
              <EmptyBucket
                title="No past orders yet"
                subtitle="Delivered and cancelled orders will be kept here."
              />
            )
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
  back: { fontSize: 32, lineHeight: 32, color: "#111", width: 24 },
  title: { fontSize: 18, fontWeight: "800", color: "#111" },

  tabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#e9e9e9",
  },
  tab: {
    flex: 1,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  tabOn: { backgroundColor: "#fff" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#777" },
  tabTextOn: { color: "#111" },

  list: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, gap: 10 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNo: { fontSize: 15, fontWeight: "800", color: "#111" },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  chipText: { fontSize: 12, fontWeight: "700" },
  itemsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumbs: { flexDirection: "row", alignItems: "center" },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#eee",
    borderWidth: 2,
    borderColor: "#fff",
  },
  thumbOverlap: { marginLeft: -16 },
  thumbEmpty: { alignItems: "center", justifyContent: "center" },
  thumbMore: { fontSize: 13, fontWeight: "800", color: "#666" },
  items: { flex: 1, fontSize: 14, color: "#555", lineHeight: 20 },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 12, color: "#888" },
  total: { fontSize: 15, fontWeight: "800", color: ORANGE },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 16,
  },
  emptyTitle: { fontSize: 15, color: "#777", textAlign: "center" },
  browseBtn: {
    paddingHorizontal: 24,
    height: 46,
    borderRadius: 14,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  browseText: { color: "#fff", fontWeight: "800" },
});

export default OrdersScreen;
