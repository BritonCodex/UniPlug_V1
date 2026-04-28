import { images } from "@/constants/images";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("screen");

const SearchComponent = () => {
  const params = useLocalSearchParams<{ query: string }>();
  const [query, setQuery] = useState<string>("");

  const handleSearch = (text: string) => {
    setQuery(text);

    if (!text) router.setParams({ query: undefined });
  };
  const handleSubmit = () => {
    if (query.trim()) router.setParams({ query });
  };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        marginBottom: 20,
      }}
    >
      <TextInput
        style={{
          padding: 5,
          alignItems: "center",
          borderWidth: 0.5,
          width: "90%",
          paddingHorizontal: 10,
          borderColor: "#b9b9b59f",
          paddingVertical: 8,
          borderRadius: 10,
        }}
        placeholder="Search "
        value={query}
        onChangeText={handleSearch}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        placeholderTextColor={"#A0A0A0"}
      />
      <TouchableOpacity
        style={{ paddingRight: 2 }}
        onPress={() => {
          router.setParams({ query: query });
        }}
      >
        <Image
          source={images.searchImage}
          resizeMode="contain"
          tintColor={"5D5F6D"}
          style={{
            width: width / width + 20,
            height: height / height + 20,
            zIndex: 999,
            paddingHorizontal: 10,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({});

export default SearchComponent;
