import { FavouriteComponentProps } from "@/constants/props";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";

const { height, width } = Dimensions.get("screen");

const FavouriteComponent = ({
  favStyles,
  onPress,
  size,
  color = "red",
  isPressed = false,
}: FavouriteComponentProps) => {
  const [pressed, setPressed] = useState<boolean>(isPressed);
  return (
    <View>
      <Pressable
        onPress={() => {
          setPressed((prev) => {
            const newPressed = !prev;
            // Optionally, you could persist this state to async storage or context here
            return newPressed;
          });
          if (onPress) onPress(onPress);
        }}
        style={[favStyles, styles.favContainer]}
      >
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <MaterialCommunityIcons
            name="cards-heart-outline"
            size={size}
            color={pressed ? "white" : "black"}
            style={{
              backgroundColor: pressed ? "red" : "white",
              width: width / width + 22,
              borderRadius: 100,
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  favContainer: {
    borderWidth: 1,
    borderColor: "#767676",
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 999,
    right: 10,
    top: 10,
    borderRadius: 100,
    //height: height / height + 30,
    //width: width / width + 30,
  },
});

export default FavouriteComponent;
