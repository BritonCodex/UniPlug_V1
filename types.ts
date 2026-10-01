//seeding code
import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[]; // list of customization names
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
    const list = await databases.listDocuments(
        appwriteConfig.databaseId,
        collectionId
    );

    await Promise.all(
        list.documents.map((doc) =>
            databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
        )
    );
}

async function clearStorage(): Promise<void> {
    const list = await storage.listFiles(appwriteConfig.bucketId);

    await Promise.all(
        list.files.map((file) =>
            storage.deleteFile(appwriteConfig.bucketId, file.$id)
        )
    );
}

async function uploadImageToStorage(imageUrl: string) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const fileObj = {
        name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
        type: blob.type,
        size: blob.size,
        uri: imageUrl,
    };

    const file = await storage.createFile(
        appwriteConfig.bucketId,
        ID.unique(),
        fileObj
    );

    return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
}

async function seed(): Promise<void> {
    // 1. Clear all
    await clearAll(appwriteConfig.categoriesCollectionId);
    await clearAll(appwriteConfig.customizationsCollectionId);
    await clearAll(appwriteConfig.menuCollectionId);
    await clearAll(appwriteConfig.menuCustomizationsCollectionId);
    await clearStorage();

    // 2. Create Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
            ID.unique(),
            cat
        );
        categoryMap[cat.name] = doc.$id;
    }

    // 3. Create Customizations
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationsCollectionId,
            ID.unique(),
            {
                name: cus.name,
                price: cus.price,
                type: cus.type,
            }
        );
        customizationMap[cus.name] = doc.$id;
    }

    // 4. Create Menu Items
    const menuMap: Record<string, string> = {};
    for (const item of data.menu) {
        const uploadedImage = await uploadImageToStorage(item.image_url);

        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            ID.unique(),
            {
                name: item.name,
                description: item.description,
                image_url: uploadedImage,
                price: item.price,
                rating: item.rating,
                calories: item.calories,
                protein: item.protein,
                categories: categoryMap[item.category_name],
            }
        );

        menuMap[item.name] = doc.$id;

        // 5. Create menu_customizations
        for (const cusName of item.customizations) {
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.menuCustomizationsCollectionId,
                ID.unique(),
                {
                    menu: doc.$id,
                    customizations: customizationMap[cusName],
                }
            );
        }
    }

    console.log("✅ Seeding complete.");
}

export default seed;













//cart component

import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/type";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {images} from "@/constants";

const CartItem = ({ item }: { item: CartItemType }) => {
    const { increaseQty, decreaseQty, removeItem } = useCartStore();

    return (
        <View className="cart-item">
            <View className="flex flex-row items-center gap-x-3">
                <View className="cart-item__image">
                    <Image
                        source={{ uri: item.image_url }}
                        className="size-4/5 rounded-lg"
                        resizeMode="cover"
                    />
                </View>

                <View>
                    <Text className="base-bold text-dark-100">{item.name}</Text>
                    <Text className="paragraph-bold text-primary mt-1">
                        ${item.price}
                    </Text>

                    <View className="flex flex-row items-center gap-x-4 mt-2">
                        <TouchableOpacity
                            onPress={() => decreaseQty(item.id, item.customizations!)}
                            className="cart-item__actions"
                        >
                            <Image
                                source={images.minus}
                                className="size-1/2"
                                resizeMode="contain"
                                tintColor={"#FF9C01"}
                            />
                        </TouchableOpacity>

                        <Text className="base-bold text-dark-100">{item.quantity}</Text>

                        <TouchableOpacity
                            onPress={() => increaseQty(item.id, item.customizations!)}
                            className="cart-item__actions"
                        >
                            <Image
                                source={images.plus}
                                className="size-1/2"
                                resizeMode="contain"
                                tintColor={"#FF9C01"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => removeItem(item.id, item.customizations!)}
                className="flex-center"
            >
                <Image source={images.trash} className="size-5" resizeMode="contain" />
            </TouchableOpacity>
        </View>
    );
};

export default CartItem;




//types

import { Models } from "react-native-appwrite";

export interface MenuItem extends Models.Document {
    name: string;
    price: number;
    image_url: string;
    description: string;
    calories: number;
    protein: number;
    rating: number;
    type: string;
}

export interface Category extends Models.Document {
    name: string;
    description: string;
}

export interface User extends Models.Document {
    name: string;
    email: string;
    avatar: string;
}

export interface CartCustomization {
    id: string;
    name: string;
    price: number;
    type: string;
}

export interface CartItemType {
    id: string; // menu item id
    name: string;
    price: number;
    image_url: string;
    quantity: number;
    customizations?: CartCustomization[];
}

export interface CartStore {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (id: string, customizations: CartCustomization[]) => void;
    increaseQty: (id: string, customizations: CartCustomization[]) => void;
    decreaseQty: (id: string, customizations: CartCustomization[]) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

interface TabBarIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
    title: string;
}

interface PaymentInfoStripeProps {
    label: string;
    value: string;
    labelStyle?: string;
    valueStyle?: string;
}

interface CustomButtonProps {
    onPress?: () => void;
    title?: string;
    style?: string;
    leftIcon?: React.ReactNode;
    textStyle?: string;
    isLoading?: boolean;
}

interface CustomHeaderProps {
    title?: string;
}

interface CustomInputProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    label: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

interface ProfileFieldProps {
    label: string;
    value: string;
    icon: ImageSourcePropType;
}

interface CreateUserParams {
    email: string;
    password: string;
    name: string;
}

interface SignInParams {
    email: string;
    password: string;
}

interface GetMenuParams {
    category: string;
    query: string;
}



//cart store
import { CartCustomization, CartStore } from "@/type";
import { create } from "zustand";

function areCustomizationsEqual(
    a: CartCustomization[] = [],
    b: CartCustomization[] = []
): boolean {
    if (a.length !== b.length) return false;

    const aSorted = [...a].sort((x, y) => x.id.localeCompare(y.id));
    const bSorted = [...b].sort((x, y) => x.id.localeCompare(y.id));

    return aSorted.every((item, idx) => item.id === bSorted[idx].id);
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],

    addItem: (item) => {
        const customizations = item.customizations ?? [];

        const existing = get().items.find(
            (i) =>
                i.id === item.id &&
                areCustomizationsEqual(i.customizations ?? [], customizations)
        );

        if (existing) {
            set({
                items: get().items.map((i) =>
                    i.id === item.id &&
                    areCustomizationsEqual(i.customizations ?? [], customizations)
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                ),
            });
        } else {
            set({
                items: [...get().items, { ...item, quantity: 1, customizations }],
            });
        }
    },

    removeItem: (id, customizations = []) => {
        set({
            items: get().items.filter(
                (i) =>
                    !(
                        i.id === id &&
                        areCustomizationsEqual(i.customizations ?? [], customizations)
                    )
            ),
        });
    },

    increaseQty: (id, customizations = []) => {
        set({
            items: get().items.map((i) =>
                i.id === id &&
                areCustomizationsEqual(i.customizations ?? [], customizations)
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ),
        });
    },

    decreaseQty: (id, customizations = []) => {
        set({
            items: get()
                .items.map((i) =>
                    i.id === id &&
                    areCustomizationsEqual(i.customizations ?? [], customizations)
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                )
                .filter((i) => i.quantity > 0),
        });
    },

    clearCart: () => set({ items: [] }),

    getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

    getTotalPrice: () =>
        get().items.reduce((total, item) => {
            const base = item.price;
            const customPrice =
                item.customizations?.reduce(
                    (s: number, c: CartCustomization) => s + c.price,
                    0
                ) ?? 0;
            return total + item.quantity * (base + customPrice);
        }, 0),
}));




///custom header

import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { CustomHeaderProps } from "@/type";
import {images} from "@/constants";

const CustomHeader = ({ title }: CustomHeaderProps) => {
    const router = useRouter();

    return (
        <View className="custom-header">
            <TouchableOpacity onPress={() => router.back()}>
                <Image
                    source={images.arrowBack}
                    className="size-5"
                    resizeMode="contain"
                />
            </TouchableOpacity>

            {title && <Text className="base-semibold text-dark-100">{title}</Text>}

            <Image source={images.search} className="size-5" resizeMode="contain" />
        </View>
    );
};

export default CustomHeader;










<Text>Hello {user?.name}</Text>
      <Button
        title="Sign Out"
        onPress={() =>
          handleLogout().catch((error) =>
            console.log("Failed to logout", error),
          )
        }
      />
      {/* <Button
        title="Seed"
        onPress={() =>
          seed().catch((error) => console.log("Failed to seed", error))
        }
      /> */}













      import { createOrder, updateUserPhoneNumber } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("screen");

const OrderFromCart = () => {
  const { user } = useAuthStore();
  const { getCartItems, getTotalItems, getTotalPrice, clearCart } =
    useCartStore();

  const userId = user?.$id || "";

  const items = getCartItems(userId);

  const totalPrice = getTotalPrice(userId);

  const totalItems = getTotalItems(userId);
  console.log("Total selected amount: ", totalItems);

  const [paymentMethod, setPaymentMethod] = React.useState<
    "manual" | "mpesa" | "cash_on_delivery"
  >("manual");

  const [transactionCode, setTransactionCode] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState(user?.phoneNumber || "");
  const orderPayload = {
    user: user?.$id,
    customerName: user?.name,
    phoneNumber,
    address: user?.address,
    items,
    total: totalPrice,
    transactionCode,
    paymentMethod,
    status: "pending",
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Complete Your Order</Text>

      {/* PAYMENT METHOD SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>

        <View style={styles.paymentRow}>
          {/* MANUAL */}
          <TouchableOpacity
            onPress={() => setPaymentMethod("manual")}
            style={[
              styles.card,
              paymentMethod === "manual" && styles.activeCard,
            ]}
          >
            <Ionicons
              name="receipt-outline"
              size={22}
              color={paymentMethod === "manual" ? "#fff" : "#FF8F3A"}
            />
            <Text
              style={[
                styles.cardText,
                paymentMethod === "manual" && styles.activeText,
              ]}
            >
              Manual
            </Text>
          </TouchableOpacity>

          {/* M-PESA */}
          <TouchableOpacity
            onPress={() => {
              setPaymentMethod("mpesa");
              Alert.alert("M-Pesa", "M-Pesa integration will be enabled soon.");
            }}
            style={[
              styles.card,
              paymentMethod === "mpesa" && styles.activeCard,
            ]}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={22}
              color={paymentMethod === "mpesa" ? "#fff" : "#FF8F3A"}
            />
            <Text
              style={[
                styles.cardText,
                paymentMethod === "mpesa" && styles.activeText,
              ]}
            >
              M-Pesa
            </Text>
          </TouchableOpacity>

          {/* CASH ON DELIVERY */}
          <TouchableOpacity
            onPress={() => setPaymentMethod("cash_on_delivery")}
            style={[
              styles.card,
              paymentMethod === "cash_on_delivery" && styles.activeCard,
            ]}
          >
            <Ionicons
              name="cash-outline"
              size={22}
              color={paymentMethod === "cash_on_delivery" ? "#fff" : "#FF8F3A"}
            />
            <Text
              style={[
                styles.cardText,
                paymentMethod === "cash_on_delivery" && styles.activeText,
              ]}
            >
              Delivery
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MANUAL INSTRUCTIONS */}
      {paymentMethod === "manual" && (
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>
            Manual Payment Instructions
          </Text>

          <Text style={styles.instructionsText}>Send money to:</Text>

          <Text style={styles.number}>0711xxxx20</Text>

          <Text style={styles.instructionsText}>
            After sending, enter your transaction code and submit the order.
          </Text>

          <Text style={styles.instructionsText}>
            Your payment will be verified shortly.
          </Text>
        </View>
      )}

      {/* MANUAL PAYMENT INPUT */}
      {paymentMethod === "manual" && (
        <View style={styles.manualInputBox}>
          <Text style={styles.inputLabel}>Transaction Code</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="receipt-outline" size={20} color="#999" />

            <TextInput
              placeholder="Enter transaction code"
              value={transactionCode}
              onChangeText={setTransactionCode}
              style={styles.input}
              placeholderTextColor="#999"
            />
          </View>
        </View>
      )}

      {/* PHONE NUMBER INPUT */}
      <View style={styles.manualInputBox}>
        <Text style={styles.inputLabel}>Phone Number</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color="#999" />

          <TextInput
            placeholder="Sender's phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* ORDER SUMMARY */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        <Text style={styles.summaryText}>Items: {totalItems}</Text>

        <Text style={styles.summaryText}>
          Total: Ksh {totalPrice.toFixed(2)}
        </Text>

        <Text style={styles.summaryText}>Customer: {user?.name}</Text>
      </View>

      {/* PAY BUTTON */}
      <TouchableOpacity
        onPress={async () => {
          try {
            if (!user) {
              Alert.alert("Error", "Please login first");
              return;
            }

            if (paymentMethod === "manual" && !transactionCode.trim()) {
              Alert.alert("Error", "Please enter transaction code");

              return;
            }

            if (items.length === 0) {
              Alert.alert("Error", "Cart is empty");

              return;
            }

            if (phoneNumber && phoneNumber !== user.phoneNumber) {
              await updateUserPhoneNumber(user.$id, phoneNumber);
            }

            const orderPayload = {
              userId: user.$id,
              customerName: user.name,
              phoneNumber,
              address: user.address || "",
              items: JSON.stringify(items),
              total: totalPrice,
              transactionCode:
                paymentMethod === "manual" ? transactionCode : "",
              paymentMethod,
              status: "pending",
            };

            await createOrder(user.$id, orderPayload);

            clearCart(user.$id);

            Alert.alert("Success", "Order placed successfully");

            router.replace("/(tabs)/Order");
          } catch (error) {
            console.log(error);

            Alert.alert("Error", "Failed to place order");
          }
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Place Order</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OrderFromCart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    padding: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111",
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },

  paymentRow: {
    flexDirection: "row",
    gap: 10,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    gap: 6,

    borderWidth: 1,
    borderColor: "#eee",
  },

  activeCard: {
    backgroundColor: "#FF8F3A",
    borderColor: "#FF8F3A",
  },

  cardText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
  },

  activeText: {
    color: "#fff",
  },

  instructionsBox: {
    backgroundColor: "#FFF7F0",
    borderWidth: 1,
    borderColor: "#FFD7B8",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },

  instructionsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    color: "#111",
  },

  instructionsText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },

  number: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FF8F3A",
    marginVertical: 8,
  },

  summary: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 20,
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  summaryText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },

  button: {
    backgroundColor: "#FF8F3A",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  manualInputBox: {
    marginTop: 12,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F6F7FB",
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  input: {
    flex: 1,
    height: 45,
    color: "#111",
  },
});
