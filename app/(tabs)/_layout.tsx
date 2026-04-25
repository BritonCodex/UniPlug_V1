import { Tabs } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet } from "react-native";

import { lightTheme } from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";

const { height, width } = Dimensions.get("screen");
type TabsProps = any;
const TabsLayout = ({ isActive }: TabsProps) => {
  //const isAuthenticated = false;
  //if (!isAuthenticated) return <Redirect href={"/(auth)/LoginScreen"} />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: lightTheme.taBarIconsFocused,
        tabBarInactiveTintColor: lightTheme.tabBarIcons,
        //tabBarButton: Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          padding: 10,
        },
        tabBarStyle: {
          height: height / height + 60,
          backgroundColor: lightTheme.tabBarColor,
          position: "absolute",
          bottom: 10,
          borderRadius: 50,
          borderWidth: 1,
          borderColor: "#1d1c1c4f",
          marginHorizontal: 10,
        },
        lazy: false,
      }}
      initialRouteName="Homescreen"
    >
      <Tabs.Screen
        name="Homescreen"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={isActive ? "home-outline" : "home"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "",
        }}
      />
      <Tabs.Screen
        name="CategoryScreen"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={isActive ? "list-outline" : "list"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "",
        }}
      />
      <Tabs.Screen
        name="CartScreen"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={isActive ? "cart-outline" : "cart"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "",
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={isActive ? "person-outline" : "person"}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "",
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({});

export default TabsLayout;
