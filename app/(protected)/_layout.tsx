import { Stack } from "expo-router";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { Redirect } from "expo-router";

export default function ProtectedLayout() {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/Login" />;
  }

  return <Stack />;
}
