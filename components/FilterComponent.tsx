import { Category } from "@/constants/props";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

const FilterComponent = ({ categories }: { categories: Category[] }) => {
  const searchParams = useLocalSearchParams();
  const [active, setActive] = useState(searchParams.category || "");

  //handler function
  const handlerPress = (id: string) => {
    setActive(id);

    if (id === "all") router.setParams({ category: undefined });
    else router.setParams({ category: id });
  };
  //filter data
  const filterData: (Category | { $id: string; name: string })[] = categories
    ? [{ $id: "all", name: "All" }, ...categories]
    : [{ $id: "all", name: "All" }];
  return (
    <FlatList
      horizontal
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 10,
        paddingBottom: 3,
        paddingHorizontal: 10,
        marginBottom: 10,
      }}
      data={filterData}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TouchableOpacity
          key={item.$id}
          style={[
            { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
            active === item.$id
              ? { backgroundColor: "orange" }
              : { backgroundColor: "white" },
            Platform.OS === "android"
              ? {
                  elevation: 10,
                  shadowColor: "#878787",
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 2 },
                }
              : {},
          ]}
          onPress={() => handlerPress(item.$id)}
        >
          <Text
            style={[
              { fontSize: 13, fontWeight: "500" },
              active === item.$id ? { color: "white" } : { color: "grey" },
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({});

export default FilterComponent;
