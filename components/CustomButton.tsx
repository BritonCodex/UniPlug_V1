import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { CustomButtonProps } from "@/constants/props";

const CustomButton = ({
  text,
  onPress,
  isLoading = false,
  //style,
  buttonStyles,
  textStyles,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[buttonStyles, styles.container]}
    >
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        {isLoading ? (
          <ActivityIndicator size={"small"} color={"white"} />
        ) : (
          <Text style={[styles.text, textStyles]}>{text}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  text: {
    fontSize: 20,
    fontWeight: "400",
  },
});

export default CustomButton;
