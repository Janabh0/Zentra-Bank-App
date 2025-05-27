import { Stack } from "expo-router";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Redirect } from "expo-router";

export default function AuthLayout() {
  const { isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated) {
    return <Redirect href="/(protected)/(tabs)/(home)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
