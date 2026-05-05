import { JSX } from "react";
import { KeyboardTypeOptions, TextStyle, ViewStyle } from "react-native";
import { Models } from "react-native-appwrite";

export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthenticationProps {
  isSecure: boolean;
  setIsSecure: (e: boolean) => void;
}

export interface ChechBoxComponentProps {
  onPress: (e: boolean) => void;
  isChecked: boolean;
}

export interface CustomButtonProps {
  text: string;
  onPress?: (e: any) => void;
  title?: string;
  isLoading?: boolean;
  style?: any;
  textStyles?: TextStyle;
  buttonStyles?: ViewStyle;
  component?: JSX.Element;
}

export interface CustomInputProps {
  placeholder: string;
  label?: string;
  value: string;
  containerStyle?: ViewStyle;
  secureTextEntry?: boolean;
  isSecure?: boolean;
  keyboardType: KeyboardTypeOptions | undefined;
  onChangeText: (text: string) => void;
  onSecurePress?: (e: any) => void;
}

export interface FavouriteComponentProps {
  favStyles?: ViewStyle;
  onPress?: (e: any) => void;
  size?: number;
  color?: string;
  isPressed?: boolean;
}

export interface CustomHeaderProps {
  title?: string;
  imageShow?: boolean;
}

export interface User extends Models.Document {
  name: string;
  email: string;
  avatar: string;
}

export interface GetMenuParams {
  category: string;
  query: string;
}

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
  items: CartItemType[];
  addItem: (item: Omit<CartItemType, "quantity">) => void;
  removeItem: (id: string, customizations: CartCustomization[]) => void;
  increaseQty: (id: string, customizations: CartCustomization[]) => void;
  decreaseQty: (id: string, customizations: CartCustomization[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export interface PaymentInfoProps {
  label: string;
  value: string;
  labelStyle?: string;
  valueStyle?: string;
}

export interface User {
  $id: string;
  accountId: string;
  name: string;
  email: string;
  avatar: string;

  phoneNumber?: string;
  address?: string;
}
