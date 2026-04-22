import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { images } from "../constants/images";
const CartComponent = () => {
  const cartItems = 10;
  return (
    <View>
      <TouchableOpacity onPress={() => console.log("To Cart")}>
        <Image
          source={images.cartImage}
          resizeMode="center"
          style={{ tintColor: "orange" }}
        />
        {cartItems > 0 && (
          <View
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "green" }}>{cartItems}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({});

export default CartComponent;
