import CartComponent from "@/components/CartComponent";
import { image_layout, images } from "@/constants/images";
import { getPickupLocations, updateUserAddress } from "@/lib/appwrite";
import { useAddressStore } from "@/store/address.sore";
import useAuthStore from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
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

  const { address, setAddress } = useAddressStore();

  React.useEffect(() => {
    if (user?.address) {
      setAddress(user.address);
    }
  }, [user]);

  const handleSelectAddress = async (newAddress: string) => {
    setAddress(newAddress);

    if (user?.$id) {
      await updateUserAddress(user.$id, newAddress);

      setUser({
        ...user,
        address: newAddress,
      });
    }
  };

  // ---------------- LOCATIONS ----------------
  const [locations, setLocations] = React.useState<any[]>([]);
  const [showLocations, setShowLocations] = React.useState(false);

  React.useEffect(() => {
    const loadLocations = async () => {
      const data = await getPickupLocations();
      setLocations(data);
    };

    loadLocations();
  }, []);

  // ---------------- FIXED ANIMATION STATE ----------------
  const translateY = React.useRef(new Animated.Value(height)).current;

  const openSheet = () => {
    setShowLocations(true);

    requestAnimationFrame(() => {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    });
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setShowLocations(false);
      translateY.setValue(height); // reset for next open
    });
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,

      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },

      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <SafeAreaView style={styles.pageContainer}>
      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={image_layout}
          renderItem={({ item, index }) => {
            const isEven = index % 2 === 0;

            return (
              <Pressable
                android_ripple={{ color: "#ffffff22" }}
                style={[
                  styles.cards,
                  { backgroundColor: item.color, borderRadius: 20 },
                  isEven
                    ? { flexDirection: "row" }
                    : { flexDirection: "row-reverse" },
                ]}
              >
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
              </Pressable>
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
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                height: height / 18,
                paddingHorizontal: 10,
                borderRadius: 7,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                  DELIVERY POINT
                </Text>

                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  onPress={openSheet}
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

              <View style={{ flexDirection: "row", gap: 10 }}>
                <CartComponent />

                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/ProfileScreen")}
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

        {/* ---------------- SHEET (NO UNMOUNT FLICKER VERSION) ---------------- */}
        {showLocations && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "flex-end",
            }}
          >
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                transform: [{ translateY }],
                backgroundColor: "#fff",
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingTop: 10,
                paddingHorizontal: 20,
                paddingBottom: 30,
                maxHeight: height * 0.65,
              }}
            >
              <View
                style={{
                  width: 45,
                  height: 5,
                  backgroundColor: "#ccc",
                  borderRadius: 20,
                  alignSelf: "center",
                  marginBottom: 10,
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "700" }}>
                  Select Pickup Point
                </Text>

                <TouchableOpacity onPress={closeSheet}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={locations}
                keyExtractor={(item) => item.$id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: loc }) => (
                  <TouchableOpacity
                    onPress={() => {
                      handleSelectAddress(loc.address);
                      closeSheet();
                    }}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: "#f7f7f7",
                      marginBottom: 10,
                    }}
                  >
                    <Text style={{ fontWeight: "600" }}>{loc.name}</Text>
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      {loc.address}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </Animated.View>
          </View>
        )}
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
