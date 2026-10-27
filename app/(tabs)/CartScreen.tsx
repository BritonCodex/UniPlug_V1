import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeaderComponent from "@/components/CustomHeaderComponent";
import EmptyCart from "@/components/EmptyCart";
import MpesaPaymentModal from "@/components/MpesaPaymentModal";
import { PaymentInfoProps } from "@/constants/props";
import { HOME_ROUTE } from "@/constants/routes";
import { lineTotal } from "@/lib/cartMath";
import { computeTotal, DELIVERY_FEE, DISCOUNT } from "@/lib/mpesa";
import { createOrder } from "@/lib/orders";
import { updateUserPhone } from "@/lib/profile";
import { useAddressStore } from "@/store/address.sore";
import useAuthStore from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { router } from "expo-router";
import React from "react";
import { Alert, FlatList, Text, View } from "react-native";
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

  // Sum the lines here: (base price + toppings/sides) x quantity. This matches what each
  // cart item shows and what M-Pesa will charge, whatever the store's own total does.
  const totalPrice = items.reduce((sum, it) => sum + lineTotal(it as any), 0);

  // Dev-only: compare with the store's own total.
  React.useEffect(() => {
    if (__DEV__)
      console.log(
        "[cart] store total:",
        getTotalPrice(),
        "| screen total:",
        totalPrice,
      );
  }, [items]);

  // Same function the payment modal and the server use, so the screen shows what M-Pesa charges.
  const grandTotal = computeTotal(totalPrice);

  const { user, setUser } = useAuthStore();
  const { address } = useAddressStore();
  const orderPromise = React.useRef<Promise<string | null> | null>(null);

  // Runs once M-Pesa confirms payment: snapshot the cart into an order, then empty the cart.
  const handlePaid = ({
    receipt,
    phone,
  }: {
    checkoutRequestId: string;
    receipt?: string;
    phone: string;
  }) => {
    const snapshot = items;

    // Remember the number that just paid on the customer's profile (and in the app's store).
    const savedPhone = `+${phone}`;
    const current: any = user;
    if (current?.$id && current.phoneNumber !== savedPhone) {
      updateUserPhone(current.$id, savedPhone)
        .then(() => setUser({ ...current, phoneNumber: savedPhone }))
        .catch((e) => {
          if (__DEV__) console.log("[profile] phone update failed:", e);
        });
    }

    orderPromise.current = (async () => {
      try {
        const u: any = user;
        const order = await createOrder({
          userId: u!.$id,
          accountId: u?.accountId,
          customerName: u?.name,
          customerEmail: u?.email,
          phoneNumber: `+${phone}`,
          address: address ?? "",
          items: snapshot,
          totalPrice: grandTotal,
          transactionCode: receipt || "N/A",
        });
        return order.$id as string;
      } catch (e) {
        if (__DEV__) console.log("[order] create failed:", e);
        Alert.alert(
          "Payment received",
          `Your M-Pesa payment went through${receipt ? ` (receipt ${receipt})` : ""}, but we couldn't save the order. Please contact support with that receipt.` +
            (__DEV__ ? `\n\nDev: ${(e as any)?.message ?? String(e)}` : ""),
        );
        return null;
      } finally {
        clearCart();
      }
    })();
  };

  // "View my order" closes the modal, then opens the order screen.
  const handleModalClose = async () => {
    setShowPayment(false);
    const pending = orderPromise.current;
    if (!pending) return;
    orderPromise.current = null;
    const orderId = await pending;
    if (__DEV__) console.log("[order] opening order screen:", orderId);
    if (!orderId) return;
    // Let the modal finish closing first; navigating mid-dismiss can be ignored.
    setTimeout(() => {
      router.push({ pathname: "/order/[id]", params: { id: orderId } } as any);
    }, 350);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f7ecd1ff" }}>
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 110,
          paddingHorizontal: 10,
          paddingTop: 5,
        }}
        ListHeaderComponent={() => (
          <CustomHeaderComponent title="Cart" imageShow={true} />
        )}
        ListEmptyComponent={() => (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <EmptyCart
              actionLabel="Browse menu"
              onAction={() => router.navigate("/(tabs)/SearchScreen" as any)}
            />
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
                onPress={() => {
                  if (!address) {
                    Alert.alert(
                      "Choose a delivery point",
                      "Select where we should deliver your order before paying.",
                      [
                        { text: "Not now", style: "cancel" },
                        {
                          text: "Choose now",
                          onPress: () => router.navigate(HOME_ROUTE as any),
                        },
                      ],
                    );
                    return;
                  }
                  setShowPayment(true);
                }}
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
        defaultPhone={(user as any)?.phoneNumber}
        onClose={handleModalClose}
        onPaid={handlePaid}
      />
    </SafeAreaView>
  );
};

export default CartScreen;
