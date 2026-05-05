import { MenuItem } from "@/constants/props";
import { appwriteConfig } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

const { height, width } = Dimensions.get("screen");

const MenuCardComponent = ({
  item: { $id, image_url, name, price },
}: {
  item: MenuItem;
}) => {
  const imageUrl = `${image_url}?project=${appwriteConfig.projectId}`;
  const { addItem } = useCartStore();
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: "#ffffff",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 60,
          paddingBottom: 15,
          borderRadius: 15,
          width: 150,
          overflow: "visible",
        },
        Platform.OS === "android"
          ? { elevation: 10, shadowColor: "#878787" }
          : {},
      ]}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{
          position: "absolute",
          top: -30,
          width: 100,
          height: 100,
          alignSelf: "center",
        }}
        resizeMode="contain"
      />

      <Text
        style={{
          marginBottom: 2,
          color: "black",
          fontSize: 15,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        {name}
      </Text>

      <Text
        style={{
          //marginBottom: 8,
          color: "black",
          fontSize: 15,
          fontWeight: "semibold",
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        From Ksh {price}
      </Text>

      <TouchableOpacity
        onPress={() => {
          addItem({
            id: $id,
            name,
            price,
            image_url: imageUrl,
            customizations: [],
          });
        }}
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "orange", fontWeight: "400" }}>Add to cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});

export default MenuCardComponent;
