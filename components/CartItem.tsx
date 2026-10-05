import { images } from "@/constants/images";
import { CartItemType } from "@/constants/props";
import { useCartStore } from "@/store/cart.store";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CartItem = ({ item }: { item: CartItemType }) => {
  const { increaseQty, decreaseQty, removeItem } = useCartStore();

  return (
    <View style={styles.row}>
      <Image
        source={{ uri: item.image_url }}
        resizeMode="cover"
        style={styles.image}
      />

      {/* Name, price, then the stepper underneath */}
      <View style={styles.details}>
        <View style={styles.textBlock}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>Ksh.{item.price}</Text>
        </View>

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
  image: {
    width: 88,
    height: 88,
    borderRadius: 12,
  },
  details: {
    flex: 1, // takes the space between the image and the trash button
    gap: 10,
  },
  textBlock: {
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF8F3A",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 12,
  },
  qty: {
    minWidth: 20,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#9c9c9c22",
    alignItems: "center",
    justifyContent: "center",
  },
  trashBtn: {
    alignSelf: "center", // vertically centred on the right edge of the item
  },
  stepIcon: {
    width: 16,
    height: 16,
  },
});

export default CartItem;
