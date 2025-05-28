import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_CONFIG, buildUrl } from "../../api/config";
import { storeToken } from "../../api/storage";
import { useAuth } from "../../context/AuthContext";

const signin = async (username: string, password: string) => {
  try {
    const response = await axios.post(buildUrl(API_CONFIG.ENDPOINTS.LOGIN), {
      username,
      password,
    });

    const token =
      response.data?.token ||
      response.data?.access_token ||
      response.data?.auth_token ||
      response.data?.accessToken;

    if (!token) {
      throw new Error("No authentication token received from server");
    }

    return token;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(
      "Login failed. Please check your credentials and try again."
    );
  }
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setIsAuthenticated } = useAuth();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      const token = await signin(username, password);
      await storeToken(token);
      return token;
    },
    onSuccess: async () => {
      setIsAuthenticated(true);
      router.replace("/(protected)/(tabs)/home");
    },
    onError: (error: any) => {
      Alert.alert(
        "Login Failed",
        error?.message || "Invalid username or password"
      );
    },
  });

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Missing Info", "Please enter both username and password.");
      return;
    }

    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!loginMutation.isLoading}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        editable={!loginMutation.isLoading}
      />

      <TouchableOpacity
        style={[
          styles.button,
          loginMutation.isLoading && styles.buttonDisabled,
        ]}
        onPress={handleLogin}
        disabled={loginMutation.isLoading}
      >
        <Text style={styles.buttonText}>
          {loginMutation.isLoading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(auth)/Register")}
        style={styles.registerLink}
        disabled={loginMutation.isLoading}
      >
        <Text style={styles.registerText}>
          Don't have an account? Register here
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
