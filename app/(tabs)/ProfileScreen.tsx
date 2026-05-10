import CustomButton from "@/components/CustomButton";
import CustomHeaderComponent from "@/components/CustomHeaderComponent";
import ProfileFieldCard from "@/components/ProfileComponent";
import useAuthStore from "@/store/auth.store";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("screen");

const ProfileScreen = () => {
  const { user } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.containerWrapper}>
      <View style={styles.backgroundGlow} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <CustomHeaderComponent title="Profile" imageShow={false} />

          {/* PROFILE CARD */}
          <View style={styles.profileCard}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: user?.avatar }}
                style={styles.profileImage}
              />
              <View style={styles.onlineDot} />
            </View>

            <Text style={styles.nameText}>{user?.name}</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>
        </View>

        {/* INFO SECTION */}
        <View style={styles.profileContent}>
          <ProfileFieldCard
            label="Name"
            value={user?.name || ""}
            icon={<Feather name="user" size={18} color="#6C63FF" />}
          />

          <ProfileFieldCard
            label="Email"
            value={user?.email || ""}
            icon={
              <MaterialCommunityIcons name="email" size={18} color="#6C63FF" />
            }
          />

          <ProfileFieldCard
            label="Phone Number"
            value={user?.phoneNumber || ""}
            icon={<Feather name="phone" size={18} color="#6C63FF" />}
          />

          <ProfileFieldCard
            label="Address"
            value={user?.address || ""}
            icon={<Feather name="map-pin" size={18} color="#6C63FF" />}
          />
        </View>

        {/* ACTION */}
        <View style={styles.actionButtons}>
          <CustomButton
            text="Sign Out"
            onPress={handleLogout}
            buttonStyles={styles.logoutButton}
            textStyles={styles.logoutText}
          />
        </View>

        {/* 👇 PREMIUM FOOTER (ADDED ONLY PART) */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>UniPlug • Version 1.0.0</Text>
          <Text style={styles.footerSubText}>
            © 2026 UniPlug. All rights reserved. Developed by Briton Kiptoo.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  backgroundGlow: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 300,
    height: 300,
    backgroundColor: "#6C63FF",
    opacity: 0.08,
    borderRadius: 150,
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 18,
  },

  profileCard: {
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECECF3",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  avatarWrapper: {
    position: "relative",
  },

  profileImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: "#6C63FF",
  },

  onlineDot: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2EE59D",
    borderWidth: 2,
    borderColor: "#fff",
  },

  nameText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  emailText: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  profileContent: {
    alignItems: "center",
    marginTop: 18,
    gap: 12,
  },

  actionButtons: {
    marginTop: 28,
    alignItems: "center",
  },

  logoutButton: {
    backgroundColor: "#FF3B30",
    width: width * 0.88,
    borderRadius: 14,
    shadowColor: "#FF3B30",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
  },

  /* ✅ NEW PREMIUM FOOTER */
  footer: {
    marginTop: 35,
    alignItems: "center",
    paddingBottom: 20,
  },

  footerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    letterSpacing: 0.5,
  },

  footerSubText: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 4,
    textAlign: "center",
  },
});

export default ProfileScreen;
