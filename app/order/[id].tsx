import CachedImage from "@/components/CachedImage";
import { HOME_ROUTE } from "@/constants/routes";
import { appwriteConfig, client } from "@/lib/appwrite";
import { fmt, lineTotal, unitPrice } from "@/lib/cartMath";
import { DELIVERY_FEE, DISCOUNT } from "@/lib/mpesa";
import { getOrder, isFailedStatus, stepIndexForStatus } from "@/lib/orders";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const ORANGE = "#FF8F3A";
const GREEN = "#2ecc71";
// Live updates arrive by push; this slow refresh is only a safety net if the connection drops.
const POLL_MS = 60_000;

const STEPS: { key: string; label: string; sub: string }[] = [
  {
    key: "placed",
    label: "Order placed",
    sub: "We've received your order and payment",
  },
  {
    key: "preparing",
    label: "Preparing",
    sub: "The kitchen is making your food",
  },
  {
    key: "on_the_way",
    label: "On the way",
    sub: "Your order is heading to you",
  },
  { key: "delivered", label: "Delivered", sub: "Enjoy your meal!" },
];

const Row = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <View style={styles.sumRow}>
    <Text style={[styles.sumText, bold && styles.sumBold]}>{label}</Text>
    <Text style={[styles.sumText, bold && styles.sumBold]}>{value}</Text>
  </View>
);

const OrderScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [order, setOrder] = React.useState<any>(null);
  const [error, setError] = React.useState("");

  // Appwrite pushes a message when this order changes, so the tracker moves instantly
  // without every customer polling the server.
  React.useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      clearTimeout(timer);
      try {
        const o = await getOrder(id);
        if (!alive) return;
        setOrder(o);
        setError("");
        if (stepIndexForStatus(o.status) < 3 && !isFailedStatus(o.status))
          timer = setTimeout(load, POLL_MS);
      } catch (e) {
        if (__DEV__) console.log("[order screen] load failed:", e);
        if (!alive) return;
        setError("Couldn't load your order. Check your connection.");
        timer = setTimeout(load, POLL_MS);
      }
    };
    load();

    const db = appwriteConfig.databaseId;
    const table = appwriteConfig.orderCollectionId;
    const unsubscribe = client.subscribe(
      [
        `databases.${db}.collections.${table}.documents.${id}`, // older channel name
        `databases.${db}.tables.${table}.rows.${id}`, // TablesDB channel name
      ],
      () => {
        if (alive) load();
      },
    );

    return () => {
      alive = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, [id]);

  const goHome = () => router.replace(HOME_ROUTE as any);

  if (!order) {
    return (
      <SafeAreaView style={styles.page}>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
        <View style={styles.center}>
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            <ActivityIndicator size="large" color={ORANGE} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const currentIndex = stepIndexForStatus(order.status);
  const failed = isFailedStatus(order.status);
  const failedTitle =
    String(order.status).toLowerCase() === "failed"
      ? "Order failed"
      : "Order cancelled";
  const subtotal = order.items.reduce(
    (sum: number, it: any) => sum + lineTotal(it),
    0,
  );
  const net = order.totalPrice - subtotal; // delivery fee minus discount
  const hasBreakdown = Math.abs(net - (DELIVERY_FEE - DISCOUNT)) < 1;
  const orderNo = `#${String(order.$id).slice(-6).toUpperCase()}`;

  return (
    <SafeAreaView style={styles.page} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Confirmation hero */}
        <View style={styles.hero}>
          <View
            style={[
              styles.checkCircle,
              failed && { backgroundColor: "#e74c3c" },
            ]}
          >
            <Text style={styles.check}>{failed ? "✕" : "✓"}</Text>
          </View>
          <Text style={styles.heroTitle}>
            {failed ? failedTitle : "Order placed!"}
          </Text>
          <Text style={styles.heroSub}>
            {orderNo} · {new Date(order.$createdAt).toLocaleString()}
          </Text>
          {!failed && currentIndex < 3 && (
            <View style={styles.etaPill}>
              <Text style={styles.etaText}>
                Estimated delivery: 20 - 30 mins
              </Text>
            </View>
          )}
        </View>

        {failed && (
          <View style={styles.card}>
            <Text style={styles.bodyText}>
              If you were charged, please contact support and quote your M-Pesa
              receipt
              {order.transactionCode ? ` (${order.transactionCode})` : ""}.
            </Text>
          </View>
        )}

        {/* Status tracker */}
        {!failed && (
          <View style={styles.card}>
            {STEPS.map((step, i) => {
              const done = i < currentIndex;
              const current = i === currentIndex;
              const last = i === STEPS.length - 1;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={styles.stepRail}>
                    <View
                      style={[
                        styles.dot,
                        (done || current) && {
                          backgroundColor: ORANGE,
                          borderColor: ORANGE,
                        },
                        current && styles.dotCurrent,
                      ]}
                    >
                      {done && <Text style={styles.dotCheck}>✓</Text>}
                    </View>
                    {!last && (
                      <View
                        style={[
                          styles.line,
                          done && { backgroundColor: ORANGE },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.stepText}>
                    <Text
                      style={[
                        styles.stepLabel,
                        !done && !current && { color: "#aaa" },
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text
                      style={[
                        styles.stepSub,
                        !done && !current && { color: "#c4c4c4" },
                      ]}
                    >
                      {step.sub}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Delivery address */}
        {!!order.address && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery point</Text>
            <Text style={styles.bodyText}>{order.address}</Text>
          </View>
        )}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your order</Text>
          {order.items.map((it: any, idx: number) => (
            <View key={`${it.id}-${idx}`} style={styles.itemRow}>
              <CachedImage
                source={{ uri: it.image_url }}
                style={styles.itemImg}
                resizeMode="cover"
              />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {it.quantity ?? 1} × {it.name}
                </Text>
                {!!it.customizations?.length && (
                  <Text style={styles.itemExtras}>
                    {it.customizations.map((c: any) => c.name).join(", ")}
                  </Text>
                )}
                <Text style={styles.itemUnit}>
                  Ksh.{fmt(unitPrice(it))} each
                </Text>
              </View>
              <Text style={styles.itemTotal}>Ksh.{fmt(lineTotal(it))}</Text>
            </View>
          ))}
        </View>

        {/* Payment summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <Row label="Subtotal" value={`Ksh.${fmt(subtotal)}`} />
          {hasBreakdown ? (
            <>
              <Row label="Delivery fee" value={`Ksh.${fmt(DELIVERY_FEE)}`} />
              <Row label="Discount" value={`-Ksh.${fmt(DISCOUNT)}`} />
            </>
          ) : (
            <Row label="Delivery & other" value={`Ksh.${fmt(net)}`} />
          )}
          <View style={styles.divider} />
          <Row label="Total paid" value={`Ksh.${fmt(order.totalPrice)}`} bold />
          <Text style={styles.receipt}>
            Paid with M-Pesa
            {order.transactionCode ? ` · Receipt ${order.transactionCode}` : ""}
          </Text>
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        <Pressable
          onPress={goHome}
          style={({ pressed }) => [
            styles.homeBtn,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Text style={styles.homeText}>Back to menu</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace("/orders" as any)}
          style={styles.ordersLink}
        >
          <Text style={styles.ordersLinkText}>View all my orders</Text>
        </Pressable>
      </View>
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
  error: { color: "#c0392b", textAlign: "center" },
  content: { padding: 16, gap: 14, paddingBottom: 24 },

  hero: { alignItems: "center", gap: 6, paddingVertical: 12 },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  check: { color: "#fff", fontSize: 32, fontWeight: "800" },
  heroTitle: { fontSize: 22, fontWeight: "800", color: "#111", marginTop: 6 },
  heroSub: { fontSize: 13, color: "#777" },
  etaPill: {
    marginTop: 6,
    backgroundColor: "#FF8F3A22",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  etaText: { color: "#a95a14", fontSize: 12, fontWeight: "700" },

  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111" },
  bodyText: { fontSize: 14, color: "#555", lineHeight: 20 },

  stepRow: { flexDirection: "row", gap: 14 },
  stepRail: { alignItems: "center" },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dotCurrent: { backgroundColor: "#fff", borderWidth: 6 },
  dotCheck: { color: "#fff", fontSize: 12, fontWeight: "800" },
  line: { width: 2, flex: 1, minHeight: 28, backgroundColor: "#e3e3e3" },
  stepText: { flex: 1, paddingBottom: 14 },
  stepLabel: { fontSize: 14, fontWeight: "700", color: "#111" },
  stepSub: { fontSize: 12, color: "#777", marginTop: 2 },

  itemRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemImg: { width: 56, height: 56, borderRadius: 12, backgroundColor: "#eee" },
  itemName: { fontSize: 14, fontWeight: "700", color: "#111" },
  itemExtras: { fontSize: 12, color: "#8a5a2b" },
  itemUnit: { fontSize: 12, color: "#888" },
  itemTotal: { fontSize: 14, fontWeight: "700", color: ORANGE },

  sumRow: { flexDirection: "row", justifyContent: "space-between" },
  sumText: { fontSize: 14, color: "#444" },
  sumBold: { fontWeight: "800", color: "#111", fontSize: 16 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ccc",
    marginVertical: 4,
  },
  receipt: { fontSize: 12, color: "#777", marginTop: 4 },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  homeBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  ordersLink: { height: 44, alignItems: "center", justifyContent: "center" },
  ordersLinkText: { color: "#a95a14", fontSize: 14, fontWeight: "700" },
  homeText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});

export default OrderScreen;
