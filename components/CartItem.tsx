import { images } from "@/constants/images";
import { CartItemType } from "@/constants/props";
import { fmt, lineTotal, unitPrice } from "@/lib/cartMath";
import { useCartStore } from "@/store/cart.store";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CartItem = ({ item }: { item: CartItemType }) => {
  const { increaseQty, decreaseQty, removeItem } = useCartStore();

  const extras: any[] = (item.customizations as any[]) ?? [];
  const qty = item.quantity ?? 1;

  return (
    <View style={styles.row}>
      <Image
        source={{ uri: item.image_url }}
        resizeMode="cover"
        style={styles.image}
      />

      <View style={styles.details}>
        <View style={styles.textBlock}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>Ksh.{fmt(unitPrice(item as any))}</Text>
          {qty > 1 && (
            <Text style={styles.lineTotal}>
              {qty} × Ksh.{fmt(unitPrice(item as any))} = Ksh.
              {fmt(lineTotal(item as any))}
            </Text>
          )}
        </View>

        {/* Selected toppings and sides */}
        {extras.length > 0 && (
          <View style={styles.extras}>
            {extras.map((c) => (
              <View key={c.id ?? c.name} style={styles.extraPill}>
                <Text style={styles.extraText} numberOfLines={1}>
                  {c.name} · +{fmt(Number(c.price) || 0)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={() => decreaseQty(item.id, item.customizations!)}
            style={styles.stepBtn}
            activeOpacity={0.7}
            hitSlop={6}
          >
            <Image
              source={images.minusImge}
              resizeMode="contain"
              style={styles.stepIcon}
            />
          </TouchableOpacity>

          <Text style={styles.qty}>{item.quantity}</Text>

          <TouchableOpacity
            onPress={() => increaseQty(item.id, item.customizations!)}
            style={styles.stepBtn}
            activeOpacity={0.7}
            hitSlop={6}
          >
            <Image
              source={images.plusImage}
              resizeMode="contain"
              style={styles.stepIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => removeItem(item.id, item.customizations!)}
        style={[styles.stepBtn, styles.trashBtn]}
        activeOpacity={0.7}
        hitSlop={6}
      >
        <Image
          source={images.trashImage}
          resizeMode="contain"
          style={styles.stepIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 10,
    borderRadius: 10,
  },
  image: { width: 88, height: 88, borderRadius: 12 },
  details: { flex: 1, gap: 8 },
  textBlock: { gap: 3 },
  name: { fontSize: 14, fontWeight: "bold" },
  price: { fontSize: 14, fontWeight: "bold", color: "#FF8F3A" },
  lineTotal: { fontSize: 12, color: "#777" },
  extras: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  extraPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#FF8F3A1f",
  },
  extraText: { fontSize: 11, color: "#7a4a1a", fontWeight: "600" },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 12,
  },
  qty: { minWidth: 20, textAlign: "center", fontSize: 14, fontWeight: "600" },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#9c9c9c22",
    alignItems: "center",
    justifyContent: "center",
  },
  trashBtn: { alignSelf: "center" },
  stepIcon: { width: 16, height: 16 },
});

export default CartItem;
