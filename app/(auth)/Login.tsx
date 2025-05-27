import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const signin = async (username: string, password: string) => {
  const response = await axios.post(
    "https://react-bank-project.eapi.joincoded.com/mini-project/api/auth/login",
    {
      username,
      password,
    }
  );
  return response.data;
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setIsAuthenticated } = useAuth();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => signin(username, password),
    onSuccess: (data) => {
      setIsAuthenticated(true);
      Alert.alert("Login Success");
      router.replace("/");
    },
    onError: (error: any) => {
      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || "Invalid username or password"
      );
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title={loginMutation.isPending ? "Logging in..." : "Login"}
        onPress={() => {
          if (!username || !password) {
            Alert.alert("Missing Info", "Please enter both fields.");
            return;
          }
          loginMutation.mutate({ username, password });
        }}
        disabled={loginMutation.isPending}
      />

      <TouchableOpacity
        onPress={() => router.push("/(auth)/Register")}
        style={styles.registerButton}
      >
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 100,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 5,
  },
  registerButton: {
    marginTop: 16,
    alignItems: "center",
  },
  registerText: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
