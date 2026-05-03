import CustomHeaderComponent from "@/components/CustomHeaderComponent";
import { CartItemType } from "@/constants/props";
import { useCartStore } from "@/store/cart.store";
import React from "react";
import { Dimensions, FlatList, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("screen");
const CartScreen = ({ item }: { item: CartItemType }) => {
  const { items, getTotalItems, getTotalPrice } = useCartStore();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  return (
    <SafeAreaView style={{ flex: 1, height, width }}>
      <FlatList
        data={items}
        renderItem={({ item }) => <Text>Cart Item</Text>}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, padding: 10 }}
        ListHeaderComponent={() => <CustomHeaderComponent title="Cart" />}
      />
      {/* <FavouriteComponent onPress={(e) => console.log("set fav")} size={20} /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default CartScreen;
