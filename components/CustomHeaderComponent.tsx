import { images } from "@/constants/images";
import { CustomHeaderProps } from "@/constants/props";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CustomHeaderComponent = ({ title, imageShow }: CustomHeaderProps) => {
  const router = useRouter();
  return (
    <View
      style={{
        //padding: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <TouchableOpacity
        style={styles.arrowImageBtn}
        onPress={() => router.back()}
      >
        <Image
          source={images.arrowBack}
          resizeMode="center"
          style={styles.images}
        />
      </TouchableOpacity>

      {title && <Text style={styles.title}>{title}</Text>}

      {imageShow === true ? (
        <Image
          source={images.searchImage}
          resizeMode="center"
          style={styles.images}
        />
      ) : (
        <TouchableOpacity>
          <MaterialCommunityIcons name="cog" size={24} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  images: {
    width: 25,
    height: 25,
  },
  arrowImageBtn: {
    backgroundColor: "#9c9c9c22",
    padding: 5,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
});

export default CustomHeaderComponent;
