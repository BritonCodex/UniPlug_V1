import { images } from "@/constants/images";
import { CustomInputProps } from "@/constants/props";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

const { height, width } = Dimensions.get("screen");

const CustomInput = ({
  placeholder,
  label,
  value,
  onChangeText,
  secureTextEntry,
  isSecure,
  onSecurePress,
  keyboardType,
  containerStyle,
}: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View
      style={[
        containerStyle,
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginHorizontal: 15,
          marginVertical: 5,
          paddingHorizontal: 10,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
      >
        {label === "Username" && (
          <Image
            source={images.userImage}
            resizeMode="center"
            style={{
              width: width / 20,
              height: height / 20,
              tintColor: "#000000",
            }}
          />
        )}
        {label === "Email" && (
          <MaterialCommunityIcons name="email" size={20} color={"#000000"} />
        )}
        {label === "Password" && (
          <Feather name="lock" size={19} color={"#000000"} />
        )}
        <Text style={{ fontSize: 15, fontWeight: "semibold" }}>{label}</Text>
      </View>

      <TextInput
        placeholder={placeholder}
        placeholderTextColor={"#7F7F7F"}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => {
          setIsFocused(true);
        }}
        onBlur={() => {
          setIsFocused(false);
        }}
        style={[
          {
            borderWidth: 0.5,
            borderColor: "#767676",
            borderRadius: 10,
            //minWidth: width / 2.23,
            width: width / 2,
            paddingHorizontal: 10,
            marginHorizontal: 10,
            fontSize: 15,
            fontWeight: 500,
            fontFamily: "monospace",
            backgroundColor: "#F8F8F8",
            overflow: "hidden",
          },
          isFocused
            ? { borderColor: "#fcbe8fff", borderWidth: 1 }
            : { borderColor: "#767676" },
          label === "Email" && {
            marginHorizontal: 40,
          },
        ]}
      />
      {isSecure && (
        <Pressable onPress={onSecurePress}>
          <Image
            source={images.eyeImage}
            style={{
              width: width / 20,
              height: height / 20,
              tintColor: "#000000",
            }}
            resizeMode="center"
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({});

export default CustomInput;
