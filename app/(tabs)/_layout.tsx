import { Redirect, Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type TabsProps = any;
const TabsLayout = ({ isActive }: TabsProps) => {
  const isAuthenticated = false;
  if (!isAuthenticated) return <Redirect href={"/(auth)/LoginScreen"} />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
        //tabBarButton: Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
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
