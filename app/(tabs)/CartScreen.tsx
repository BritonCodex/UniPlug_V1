import CartItem from "@/components/CartItem";
import CrossLoader from "@/components/CrossLoader";
import CustomButton from "@/components/CustomButton";
import CustomHeaderComponent from "@/components/CustomHeaderComponent";
import MpesaPaymentModal from "@/components/MpesaPaymentModal";
import { PaymentInfoProps } from "@/constants/props";
import { computeTotal, DELIVERY_FEE, DISCOUNT } from "@/lib/mpesa";
import { useCartStore } from "@/store/cart.store";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentInfo = ({ label, value }: PaymentInfoProps) => {
  return (
    <View
      style={{
        justifyContent: "space-between",
        flexDirection: "row",
        marginVertical: 10,
      }}
    >
      <Text style={{ fontSize: 14, color: "black", fontWeight: "400" }}>
        {label}
      </Text>
      <Text style={{ fontSize: 14, color: "black", fontWeight: "400" }}>
        {value}
      </Text>
    </View>
  );
};

const CartScreen = () => {
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore();
  const [showPayment, setShowPayment] = React.useState(false);

  const totalItems = getTotalItems();

  // Use the store's total when it's a real number; otherwise sum the lines here.
  // Adjust `price` / `quantity` if your CartItemType names them differently.
  const storeTotal = Number(getTotalPrice());
  const lineTotal = items.reduce(
    (sum, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
    0,
  );
  const totalPrice = storeTotal > 0 ? storeTotal : lineTotal;

  // Dev-only: shows why a total comes out as 0.
  React.useEffect(() => {
    if (__DEV__) {
      console.log("[cart] store total:", getTotalPrice(), "| line total:", lineTotal);
      console.log("[cart] first item:", JSON.stringify(items[0]));
    }
  }, [items]);
  // Same function the payment modal and the server use, so the screen shows what M-Pesa charges.
  const grandTotal = computeTotal(totalPrice);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 28,
          paddingHorizontal: 10,
          paddingTop: 5,
        }}
        ListHeaderComponent={() => (
          <CustomHeaderComponent title="Cart" imageShow={true} />
        )}
        ListEmptyComponent={() => (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <CrossLoader />
            <Text style={{ marginTop: 10, color: "#6666668f", fontSize: 14 }}>
              Your cart is empty
            </Text>
          </View>
        )}
        ListFooterComponent={() =>
          totalItems > 0 ? (
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
                <PaymentInfo
                  label="Delivery Fee"
                  value={`Ksh.${DELIVERY_FEE}`}
                />
                <PaymentInfo label="Discount" value={`-Ksh.${DISCOUNT}`} />

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
                  label="Total"
                  value={`Ksh.${grandTotal.toFixed(2)}`}
                />
              </View>

              {/* Assumes CustomButton accepts an onPress prop. */}
              <CustomButton
                text="Order now"
                onPress={() => setShowPayment(true)}
                buttonStyles={{
                  backgroundColor: "#FF8F3A",
                  width: "100%",
                  alignSelf: "center",
                }}
                textStyles={{
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            </View>
          ) : null
        }
      />

      <MpesaPaymentModal
        visible={showPayment}
        amount={grandTotal}
        onClose={() => setShowPayment(false)}
        onPaid={() => clearCart()}
      />
    </SafeAreaView>
  );
};

export default CartScreen;