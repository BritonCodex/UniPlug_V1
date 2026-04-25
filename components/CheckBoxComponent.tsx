import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, Pressable, StyleSheet } from "react-native";

import { ChechBoxComponentProps } from "@/constants/props";

const { width, height } = Dimensions.get("screen");
const CheckBoxComponent = ({
  onPress = () => {},
  isChecked = false,
}: ChechBoxComponentProps) => {
  const [checked, setChecked] = useState(isChecked);
  return (
    <Pressable
      onPress={() => {
        setChecked(!checked);
        onPress(!checked);
      }}
      style={{
        borderWidth: 1,
        width: width / width + 25,
        height: height / height + 25,
        alignItems: "center",
        borderRadius: 10,
        borderCurve: "continuous",
        borderColor: "black",
      }}
    >
      {checked && <MaterialIcons name="check" size={22} color={"#000000"} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({});

export default CheckBoxComponent;
