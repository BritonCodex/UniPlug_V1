import CartComponent from "@/components/CartComponent";
import { image_layout, images } from "@/constants/images";
import { updateUserAddress } from "@/lib/appwrite";
import { useAddressStore } from "@/store/address.sore";
import useAuthStore from "@/store/auth.store";
import { router } from "expo-router";
import React, { Fragment } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("screen");
const Homescreen = () => {
  const { user, setUser } = useAuthStore();
  console.log("User:", JSON.stringify(user, null, 2));

  //selection of address
  const { address, setAddress } = useAddressStore();
  React.useEffect(() => {
    if (user?.address) {
      setAddress(user.address);
    }
  }, [user]);
  const handleSelectAddress = async (newAddress: string) => {
    setAddress(newAddress); // instant UI

    if (user?.$id) {
      await updateUserAddress(user.$id, newAddress);

      setUser({
        ...user,
        address: newAddress,
      });
    }
  };

  return (
    <SafeAreaView style={styles.pageContainer}>
      {/* header component */}

      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          data={image_layout}
          renderItem={({ item, index }) => {
            const isEven = index % 2 === 0;
            return (
              <View>
                <Pressable
                  android_ripple={{ color: "#ffffff22" }}
                  style={[
                    styles.cards,
                    { backgroundColor: item.color, borderRadius: 20 },
                    isEven
                      ? {
                          flexDirection: "row",
                          //borderTopEndRadius: 20,
                          //borderBottomStartRadius: 20,
                        }
                      : {
                          flexDirection: "row-reverse",
                          //borderTopStartRadius: 20,
                          //borderBottomEndRadius: 20,
                        },
                  ]}
                >
                  {({ pressed }) => (
                    <Fragment>
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={item.image}
                          resizeMode="center"
                          style={{
                            width: width / 2,
                            height: height / 7,
                            marginTop: 10,
                          }}
                        />
                      </View>
                      <View style={{ gap: 10 }}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Image
                          source={images.arrowRight}
                          resizeMode="center"
                          tintColor={"#fff"}
                        />
                      </View>
                    </Fragment>
                  )}
                </Pressable>
              </View>
            );
          }}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingVertical: 10,
            marginBottom: 10,
          }}
          ListHeaderComponent={
            <View
              style={{
                backgroundColor: "#9c9c9c22",
                //flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                height: height / 18,
                paddingHorizontal: 10,
                borderRadius: 7,
                shadowColor: "#000", // Added a default shadow color
              }}
            >
              <View style={{ flexDirection: "column", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "bold",
                    fontFamily: "PlayfairDisplay-Bold",
                  }}
                >
                  DELIVERY POINT
                </Text>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                  onPress={() => {
                    handleSelectAddress("Nairobi, Kenya"); // temp test
                  }}
                >
                  <Text style={{ fontSize: 10 }}>
                    {address || "Set delivery address"}
                  </Text>
                  <Image
                    source={images.arrowDown}
                    resizeMode="center"
                    tintColor={"#000"}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <CartComponent />

                <TouchableOpacity
                  onPress={() => {
                    router.push("/(tabs)/ProfileScreen");
                  }}
                >
                  <Image
                    source={{ uri: user?.avatar }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    //padding: 1,
    backgroundColor: "#9c9c9c22",
  },
  container: {
    flex: 1,
    alignItems: "center",
    //justifyContent: "center",
    backgroundColor: "#fff",
    //borderRadius: 7,
    //borderCurve: "circular",
  },
  text: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    fontFamily: "PlayfairDisplay-Bold",
    //lineHeight: 20,
  },
  desc: {
    fontSize: 10,
    textAlign: "center",
    color: "red",
    fontFamily: "PlayfairDisplay-Regular",
  },
  cards: {
    width: width - 20,
    height: height / 7,
    padding: 20,
    //borderTopEndRadius: 12,
    //borderBottomStartRadius: 12,
    //overflow: "hidden",
    //flex: 1,
    //alignItems: "center",
    gap: 20,
    marginVertical: 4,
    //marginHorizontal: 5,
  },
});

export default Homescreen;
