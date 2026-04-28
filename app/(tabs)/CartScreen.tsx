import FavouriteComponent from "@/components/FavouriteComponent";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CartScreen = () => {
  return (
    <SafeAreaView>
      <Text>Cart screen</Text>
      <FavouriteComponent onPress={(e) => console.log("set fav")} size={20} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default CartScreen;
