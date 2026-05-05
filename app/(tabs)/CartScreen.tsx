import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeaderComponent from "@/components/CustomHeaderComponent";
import { CartItemType, PaymentInfoProps } from "@/constants/props";
import { useCartStore } from "@/store/cart.store";
import React from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("screen");
const PaymentInfo = ({
  label,
  value,
  labelStyle,
  valueStyle,
}: PaymentInfoProps) => {
  return (
    <View
      style={{
        justifyContent: "space-between",
        flexDirection: "row",
        marginVertical: 10,
      }}
    >
      <Text
        style={[
          { fontSize: 14, color: "black", fontWeight: 200 },
          {
            /*labelStyle*/
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          { fontSize: 14, color: "black", fontWeight: 200 },
          {
            /*valueStyle*/
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};
const CartScreen = ({ item }: { item: CartItemType }) => {
  const { items, getTotalItems, getTotalPrice } = useCartStore();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  return (
    <SafeAreaView style={{ flex: 1, height, width }}>
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: 28,
          paddingHorizontal: 10,
          paddingTop: 5,
          //backgroundColor: "red",
          height: "100%",
        }}
        ListHeaderComponent={() => (
          <CustomHeaderComponent title="Cart" imageShow={true} />
        )}
        ListEmptyComponent={() => (
          <Text
            style={{
              fontSize: 15,
              fontWeight: 400,
              lineHeight: 2,
              textAlign: "center",
            }}
          >
            Cart empty
          </Text>
        )}
        ListFooterComponent={() =>
          totalItems > 0 && (
            <View style={{ gap: 5 }}>
              <View
                style={{
                  marginTop: 10,
                  backgroundColor: "#c2bfbf85",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    color: "black",
                    fontWeight: "bold",
                    marginBottom: 5,
                  }}
                >
                  Payment Summary
                </Text>
                <PaymentInfo
                  label={`Total Items (${totalItems})`}
                  value={`Ksh.${totalPrice.toFixed(2)}`}
                />
                <PaymentInfo label={`Delivery Fee`} value={`Ksh.200`} />
                <PaymentInfo
                  label={`Discount`}
                  value={`-Ksh.10`}
                  // valueStyle="!text-success"
                />

                <View
                  style={{
                    marginTop: 10,
                    marginBottom: 5,
                    borderWidth: 0.5,
                    borderColor: "grey",
                    marginHorizontal: 1,
                    borderRadius: 10,
                  }}
                />

                <PaymentInfo
                  label={`Total`}
                  value={`Ksh.${(totalPrice + 50 - 10).toFixed(2)}`}
                />
              </View>

              <CustomButton
                text="OrderNow"
                buttonStyles={{
                  backgroundColor: "#FF8F3A",
                  width: width / 1.1,
                  marginHorizontal: 20,
                  alignSelf: "center",
                }}
                textStyles={{
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            </View>
          )
        }
      />
      {/* <FavouriteComponent onPress={(e) => console.log("set fav")} size={20} /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default CartScreen;
