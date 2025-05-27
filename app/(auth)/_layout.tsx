import { Redirect, Stack } from "expo-router";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated) {
    return <Redirect href="/(protected)/(tabs)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
