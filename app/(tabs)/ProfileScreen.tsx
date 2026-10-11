import AdminOrdersLink from "@/components/AdminOrdersLink";
import CustomButton from "@/components/CustomButton";
import CustomHeaderComponent from "@/components/CustomHeaderComponent";
import ProfileFieldCard from "@/components/ProfileComponent";
import ProfileRow from "@/components/ProfileRow";
import { images } from "@/constants/images";
import useAuthStore from "@/store/auth.store";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ORANGE = "#FF8F3A";

const ProfileScreen = () => {
  const { user } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.glow} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <CustomHeaderComponent title="Profile" imageShow={false} />

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={user?.avatar ? { uri: user.avatar } : images.userImage}
              style={styles.avatar}
            />
            <View style={styles.onlineDot} />
          </View>

          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* ACCOUNT DETAILS */}
        <Text style={styles.sectionTitle}>Account details</Text>
        <View style={styles.fields}>
          <ProfileFieldCard
            label="Name"
            value={user?.name || "Not set"}
            icon={<Feather name="user" size={18} color={ORANGE} />}
          />
          <ProfileFieldCard
            label="Email"
            value={user?.email || "Not set"}
            icon={
              <MaterialCommunityIcons name="email" size={18} color={ORANGE} />
            }
          />
          <ProfileFieldCard
            label="Phone Number"
            value={user?.phoneNumber || "Not set"}
            icon={<Feather name="phone" size={18} color={ORANGE} />}
          />
          <ProfileFieldCard
            label="Address"
            value={user?.address || "Not set"}
            icon={<Feather name="map-pin" size={18} color={ORANGE} />}
          />
        </View>

        {/* SHORTCUTS */}
        <Text style={styles.sectionTitle}>Orders</Text>
        <View style={styles.rows}>
          <ProfileRow
            icon="shopping-bag"
            label="My orders"
            subtitle="Track and review your orders"
            onPress={() => router.push("/orders" as any)}
          />
          <AdminOrdersLink />
        </View>

        {/* SIGN OUT */}
        <View style={styles.signOut}>
          <CustomButton
            text="Sign Out"
            onPress={handleLogout}
            buttonStyles={styles.logoutButton}
            textStyles={styles.logoutText}
          />
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>UniPlug • Version 1.0.0</Text>
          <Text style={styles.footerSub}>
            © 2026 UniPlug. All rights reserved. Developed by Briton Kiptoo.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f6f6f6" },

  glow: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: ORANGE,
    opacity: 0.12,
  },

  // Extra bottom padding so the floating tab bar never covers the footer.
  container: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 110 },

  profileCard: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: ORANGE,
    backgroundColor: "#eee",
  },
  onlineDot: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2ecc71",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: { marginTop: 12, fontSize: 19, fontWeight: "800", color: "#111" },
  email: { fontSize: 13, color: "#777", marginTop: 2 },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "800",
    color: "#3B2D2A",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  fields: { alignItems: "center", gap: 12 },
  rows: { gap: 12 },

  signOut: { marginTop: 28 },
  logoutButton: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e74c3c55",
    borderRadius: 16,
  },
  logoutText: { color: "#e74c3c", fontWeight: "800" },

  footer: { marginTop: 32, alignItems: "center", paddingBottom: 12 },
  footerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    letterSpacing: 0.5,
  },
  footerSub: { fontSize: 10, color: "#aaa", marginTop: 4, textAlign: "center" },
});

export default ProfileScreen;
