import CachedImage from "@/components/CachedImage";
import { fmt, lineTotal, unitPrice } from "@/lib/cartMath";
import {
  getAllOrders,
  isAdmin,
  isFailedStatus,
  STATUS_VALUE,
  stepIndexForStatus,
  updateOrderStatus,
} from "@/lib/orders";
import { Feather } from "@expo/vector-icons";
import { router, Stack, useFocusEffect } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
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

  // Opens the phone's dialer with the customer's number filled in.
  const callCustomer = async (phone?: string) => {
    if (!phone) return;
    try {
      await Linking.openURL(`tel:${phone.replace(/[^\d+]/g, "")}`);
    } catch {
      Alert.alert("Can't place the call", `Dial ${phone} manually.`);
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

        {/* Delivery point and payment */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery point</Text>
            <Text style={styles.infoValue}>{o.address || "Not provided"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {o.paymentMethod === "MPESA" ? "M-Pesa receipt" : "Payment"}
            </Text>
            <Text style={[styles.infoValue, styles.receipt]} selectable>
              {o.transactionCode || "None"}
            </Text>
          </View>
        </View>

        {/* Every item with its toppings and sides */}
        <View style={styles.itemsBox}>
          {o.items.length === 0 && (
            <Text style={styles.meta}>Order details unavailable</Text>
          )}
          {o.items.map((it: any, idx: number) => (
            <View key={`${it.id}-${idx}`} style={styles.itemBlock}>
              {it.image_url ? (
                <CachedImage
                  source={{ uri: it.image_url }}
                  style={styles.itemImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.itemImg, styles.itemImgEmpty]}>
                  <Text>🍽️</Text>
                </View>
              )}
              <View style={styles.itemContent}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {it.quantity ?? 1} × {it.name}
                  </Text>
                  <Text style={styles.itemPrice}>Ksh.{fmt(lineTotal(it))}</Text>
                </View>
                {(it.customizations ?? []).map((c: any, i: number) => (
                  <Text key={`${c.name}-${i}`} style={styles.extra}>
                    + {c.name} (Ksh.{fmt(Number(c.price) || 0)})
                  </Text>
                ))}
                {(it.customizations ?? []).length === 0 && (
                  <Text style={styles.extraNone}>No extras</Text>
                )}
                {(it.quantity ?? 1) > 1 && (
                  <Text style={styles.extraNone}>
                    Ksh.{fmt(unitPrice(it))} each
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

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
            {!!o.phoneNumber && (
              <Pressable
                disabled={busy}
                onPress={() => callCustomer(o.phoneNumber)}
                style={({ pressed }) => [
                  styles.callBtn,
                  { opacity: busy || pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="phone-call" size={16} color="#fff" />
                <Text style={styles.callText}>Call</Text>
              </Pressable>
            )}
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
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2ecc71",
  },
  callText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  meta: { fontSize: 12, color: "#888" },
  infoBox: {
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  infoRow: { gap: 2 },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: { fontSize: 14, color: "#222", fontWeight: "600" },
  receipt: { color: "#a95a14", letterSpacing: 0.5 },
  itemsBox: { gap: 10, paddingVertical: 4 },
  itemBlock: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  itemContent: { flex: 1, gap: 2 },
  itemImg: { width: 54, height: 54, borderRadius: 12, backgroundColor: "#eee" },
  itemImgEmpty: { alignItems: "center", justifyContent: "center" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  itemName: { flex: 1, fontSize: 14, fontWeight: "700", color: "#111" },
  itemPrice: { fontSize: 14, fontWeight: "700", color: "#444" },
  extra: { fontSize: 13, color: "#8a5a2b", marginLeft: 4 },
  extraNone: { fontSize: 12, color: "#999", marginLeft: 4 },
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
