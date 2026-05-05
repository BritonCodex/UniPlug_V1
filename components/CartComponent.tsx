import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useCartStore } from "@/store/cart.store";
import { router } from "expo-router";
import { images } from "../constants/images";
const CartComponent = () => {
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  return (
    <View>
      <TouchableOpacity onPress={() => router.navigate("/(tabs)/CartScreen")}>
        <Image
          source={images.cartImage}
          resizeMode="center"
          style={{ tintColor: "orange" }}
        />
        {totalItems > 0 && (
          <View
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "green" }}>{totalItems}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({});

export default CartComponent;
