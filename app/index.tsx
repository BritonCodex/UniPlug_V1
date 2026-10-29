
import { Redirect } from "expo-router";
import useAuthStore from "@/store/auth.store";

export default function Index() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/Homescreen" />;
  }

  return <Redirect href="/(auth)/LoginScreen" />;
}
