import CustomButton from "@/components/CustomButton";
import CustomHeaderComponent from "@/components/CustomHeaderComponent";
import ProfileFieldCard from "@/components/ProfileComponent";
import useAuthStore from "@/store/auth.store";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("screen");
const ProfileScreen = () => {
  const { user } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const handleLogout = async () => {
    await logout();
  };
  return (
    <SafeAreaView style={styles.containerWrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <CustomHeaderComponent title="Profile" imageShow={false} />
          <View
            style={{
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Image source={{ uri: user?.avatar }} style={styles.profileImage} />
          </View>
        </View>
        <View style={styles.profileContent}>
          <ProfileFieldCard
            label="Name"
            value={user?.name || ""}
            icon={<Feather name="user" size={18} color="#333" />}
          />

          <ProfileFieldCard
            label="Email"
            value={user?.email || ""}
            icon={
              <MaterialCommunityIcons name="email" size={18} color="#333" />
            }
          />

          <ProfileFieldCard
            label="Phone Number"
            value={user?.phoneNumber || ""}
            icon={<Feather name="phone" size={18} color="#333" />}
          />

          <ProfileFieldCard
            label="Address"
            value={user?.address || ""}
            icon={<Feather name="map-pin" size={18} color="#333" />}
          />
        </View>
        <View style={styles.actionButtons}>
          <CustomButton
            text="Sign Out"
            onPress={() =>
              handleLogout().catch((error) =>
                console.log("Failed to logout", error),
              )
            }
            buttonStyles={{
              backgroundColor: "#eb6941ff",
              width: width / 1.4,
              marginHorizontal: 20,
              alignSelf: "center",
            }}
            textStyles={{
              color: "white",
              fontWeight: "bold",
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: width,
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  header: {
    width: "100%",
    padding: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "white",
    marginTop: 10,
  },
  profileContent: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    gap: 12,
  },

  actionButtons: {
    width: "100%",
    alignItems: "center",
    marginTop: 25,
    gap: 10,
    paddingBottom: 20,
  },
});

export default ProfileScreen;
