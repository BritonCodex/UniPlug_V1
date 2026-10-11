import { fmt } from "@/lib/cartMath";
import {
  getAllOrders,
  isAdmin,
  isFailedStatus,
  STATUS_VALUE,
  stepIndexForStatus,
  updateOrderStatus,
} from "@/lib/orders";
import { router, Stack, useFocusEffect } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORANGE = "#FF8F3A";

const LABEL: Record<string, string> = {
  pending: "Pending",
  verified: "Confirmed",
  processing: "Preparing",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

// What the single main button does for each stage.
const nextAction = (status: string) => {
  const step = stepIndexForStatus(status);
  if (isFailedStatus(status) || step === 3) return null;
  if (step === 0)
    return { label: "Start preparing", value: STATUS_VALUE.preparing };
  if (step === 1)
    return { label: "Out for delivery", value: STATUS_VALUE.on_the_way };
  return { label: "Mark delivered", value: STATUS_VALUE.delivered };
};

const summarize = (items: any[]) =>
  items.length
    ? items.map((it) => `${it.quantity ?? 1} × ${it.name}`).join(", ")
    : "Order details unavailable";

const AdminOrders = () => {
  const [allowed, setAllowed] = React.useState<boolean | null>(null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [tab, setTab] = React.useState<"active" | "done">("active");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    const ok = await isAdmin();
    setAllowed(ok);
    if (!ok) return;
    try {
      setOrders(await getAllOrders());
      setError("");
    } catch (e: any) {
      setError(e?.message ?? "Couldn't load orders.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load]),
  );

  const setStatus = async (orderId: string, value: string) => {
    try {
      setBusyId(orderId);
      await updateOrderStatus(orderId, value);
      setOrders((cur) =>
        cur.map((o) => (o.$id === orderId ? { ...o, status: value } : o)),
      );
    } catch (e: any) {
      Alert.alert("Couldn't update the order", e?.message ?? "Try again.");
    } finally {
      setBusyId(null);
    }
  };

  const confirmCancel = (orderId: string) =>
    Alert.alert(
      "Cancel this order?",
      "The customer will see it as cancelled.",
      [
        { text: "Keep order", style: "cancel" },
        {
          text: "Cancel order",
          style: "destructive",
          onPress: () => setStatus(orderId, STATUS_VALUE.cancelled),
        },
      ],
    );

  const isDone = (o: any) =>
    stepIndexForStatus(o.status) === 3 || isFailedStatus(o.status);
  const visible = orders.filter((o) =>
    tab === "done" ? isDone(o) : !isDone(o),
  );

  const renderOrder = ({ item: o }: { item: any }) => {
    const action = nextAction(o.status);
    const busy = busyId === o.$id;
    return (
      <View style={styles.card}>
        <View style={styles.top}>
          <Text style={styles.no}>
            #{String(o.$id).slice(-6).toUpperCase()}
          </Text>
          <Text style={styles.chip}>
            {LABEL[String(o.status).toLowerCase()] ?? o.status}
          </Text>
        </View>

        <Text style={styles.who}>
          {o.customerName || "Customer"}
          {o.phoneNumber ? ` · ${o.phoneNumber}` : ""}
        </Text>
        {!!o.address && (
          <Text style={styles.meta}>Deliver to: {o.address}</Text>
        )}
        <Text style={styles.items}>{summarize(o.items)}</Text>

        <View style={styles.bottom}>
          <Text style={styles.total}>Ksh.{fmt(o.totalPrice)}</Text>
          <Text style={styles.meta}>
            {new Date(o.$createdAt).toLocaleString()}
          </Text>
        </View>

        {action && (
          <View style={styles.actions}>
            <Pressable
              disabled={busy}
              onPress={() => setStatus(o.$id, action.value)}
              style={({ pressed }) => [
                styles.mainBtn,
                { opacity: busy || pressed ? 0.7 : 1 },
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.mainText}>{action.label}</Text>
              )}
            </Pressable>
            <Pressable
              disabled={busy}
              onPress={() => confirmCancel(o.$id)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.page} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {allowed === null ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ORANGE} />
        </View>
      ) : !allowed ? (
        <View style={styles.center}>
          <Text style={styles.note}>This screen is for admins only.</Text>
        </View>
      ) : (
        <>
          <View style={styles.tabs}>
            {(["active", "done"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tab, tab === t && styles.tabOn]}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
                  {t === "active" ? "Active" : "Completed"}
                </Text>
              </Pressable>
            ))}
          </View>

          <FlatList
            data={visible}
            keyExtractor={(o) => o.$id}
            renderItem={renderOrder}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            ListEmptyComponent={
              <Text
                style={[styles.note, { textAlign: "center", marginTop: 60 }]}
              >
                {error || "No orders here"}
              </Text>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f6f6f6" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  note: { color: "#777", fontSize: 15 },
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
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, gap: 8 },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  no: { fontSize: 15, fontWeight: "800", color: "#111" },
  chip: {
    fontSize: 12,
    fontWeight: "700",
    color: "#a95a14",
    backgroundColor: "#FF8F3A22",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
  who: { fontSize: 14, fontWeight: "700", color: "#222" },
  meta: { fontSize: 12, color: "#888" },
  items: { fontSize: 14, color: "#555", lineHeight: 20 },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: { fontSize: 15, fontWeight: "800", color: ORANGE },
  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  mainBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  mainText: { color: "#fff", fontWeight: "800" },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#e74c3c18",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: "#c0392b", fontWeight: "700" },
});

export default AdminOrders;
