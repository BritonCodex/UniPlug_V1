import useAppwrite from "@/lib/useAppwrite";
import React, { useEffect } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CartComponent from "@/components/CartComponent";
import FilterComponent from "@/components/FilterComponent";
import MenuCardComponent from "@/components/MenuCardComponent";
import SearchComponent from "@/components/SearchComponent";
import { MenuItem } from "@/constants/props";
import { getCategories, getMenu } from "@/lib/appwrite";
import { useLocalSearchParams } from "expo-router";

const { width, height } = Dimensions.get("screen");

const SearchScreen = () => {
  const { category, query } = useLocalSearchParams<{
    query: string;
    category: string;
  }>();

  const { data, refetch, loading } = useAppwrite({
    fn: getMenu,
    params: {
      category: "",
      query: "",
      limit: 6,
    },
  });
  const { data: categories } = useAppwrite({ fn: getCategories });

  //console.log(data);

  useEffect(() => {
    refetch({ category, query, limit: 6 });
  }, [category, query]);

  return (
    <SafeAreaView style={{ backgroundColor: "white", height: "100%", flex: 1 }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        style={{ overflow: "visible" }}
        data={data}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;
          return (
            <View
              style={[
                {
                  flex: 1,
                  //width: width,
                  //height: height / height + 90,
                  //backgroundColor: "#635e5ec2",
                  paddingHorizontal: 20,
                },
                !isFirstRightColItem
                  ? { marginTop: 40 }
                  : { marginTop: 20, marginBottom: 10 },
              ]}
            >
              <MenuCardComponent item={item as unknown as MenuItem} />
              {/* <Text>Menu items</Text> */}
            </View>
          );
        }}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperStyle={{ gap: 7 }}
        contentContainerStyle={{
          gap: 1,
          paddingHorizontal: 10,
          paddingBottom: 100,
          //height: height,
        }}
        ListHeaderComponent={() => (
          <View style={{ marginVertical: 5, gap: 5, paddingHorizontal: 10 }}>
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
                width: "100%",
              }}
            >
              <View style={{ alignItems: "flex-start" }}>
                <Text
                  style={{ fontWeight: "bold", fontSize: 16, color: "orange" }}
                >
                  Search
                </Text>
                <View
                  style={{
                    alignItems: "flex-start",
                    flexDirection: "row",
                    rowGap: 1,
                    marginTop: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: "#292828c2",
                    }}
                  >
                    Find your favorite food
                  </Text>
                </View>
              </View>

              <CartComponent />
            </View>
            <SearchComponent />
            <FilterComponent categories={categories as any} />
          </View>
        )}
        ListEmptyComponent={() => !loading && <Text>No results</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default SearchScreen;
