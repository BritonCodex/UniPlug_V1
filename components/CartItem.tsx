import { images } from "@/constants/images";
import { CartItemType } from "@/constants/props";
import { useCartStore } from "@/store/cart.store";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("screen");
const CartItem = ({ item }: { item: CartItemType }) => {
  const { increaseQty, decreaseQty, removeItem } = useCartStore();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        //backgroundColor: "red",
        borderRadius: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Image
          source={{ uri: item.image_url }}
          resizeMode="cover"
          style={{ width: 80, height: 80, borderRadius: 10 }}
        />
        <View style={{ flexDirection: "column", gap: 5 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>{item.name}</Text>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>
            Ksh.{item.price}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => decreaseQty(item.id, item.customizations!)}
            style={styles.touchable}
          >
            <Image
              source={images.minusImge}
              resizeMode="center"
              style={{
                width: width / width + 15,
                height: height / height + 15,
              }}
            />
          </TouchableOpacity>
          <Text>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => increaseQty(item.id, item.customizations!)}
            style={styles.touchable}
          >
            <Image
              source={images.plusImage}
              resizeMode="center"
              style={{
                width: width / width + 15,
                height: height / height + 15,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => removeItem(item.id, item.customizations!)}
        style={styles.touchable}
      >
        <Image source={images.trashImage} resizeMode="center" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    backgroundColor: "#9c9c9c22",
    padding: 5,
    borderRadius: 10,
  },
});

export default CartItem;
