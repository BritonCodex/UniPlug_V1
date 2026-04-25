import { JSX } from "react";
import { KeyboardTypeOptions, TextStyle, ViewStyle } from "react-native";

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
