import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_CONFIG, buildUrl } from "../../api/config";

const register = async (
  username: string,
  password: string,
  imageUri?: string | null
) => {
  const formData = new FormData();

  formData.append("username", username);
  formData.append("password", password);

  if (imageUri) {
    try {
      const fileName = imageUri.split("/").pop() || "profile.jpg";
      const fileType = fileName.split(".").pop()?.toLowerCase() || "jpg";

      formData.append("image", {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType}`,
      } as any);
    } catch (error) {
      console.error("Error preparing image:", error);
      throw new Error("Failed to prepare image for upload");
    }
  }

  try {
    const response = await axios.post(
      buildUrl(API_CONFIG.ENDPOINTS.REGISTER),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Registration failed. Please try again.");
  }
};

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const router = useRouter();

  const pickImage = async () => {
    if (isPickingImage) return;

    try {
      setIsPickingImage(true);

      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload an image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const registerMutation = useMutation({
    mutationFn: ({
      username,
      password,
      imageUri,
    }: {
      username: string;
      password: string;
      imageUri?: string | null;
    }) => register(username, password, imageUri),
    onSuccess: () => {
      Alert.alert("Success", "Registration complete. Please log in.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/Login"),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        "Registration Failed",
        error?.message || "Something went wrong. Please try again."
      );
    },
  });

  const handleRegister = () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Missing Info", "Username and password are required.");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters long."
      );
      return;
    }

    registerMutation.mutate({
      username: username.trim(),
      password,
      imageUri: image,
    });
  };

  const goToLogin = () => {
    router.push("/(auth)/Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TouchableOpacity
        onPress={pickImage}
        style={styles.imagePickerContainer}
        disabled={isPickingImage || registerMutation.isLoading}
      >
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultImageContainer}>
              <Ionicons name="person-circle-outline" size={60} color="#666" />
              <Text style={styles.uploadText}>Tap to upload photo</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!registerMutation.isLoading}
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        editable={!registerMutation.isLoading}
      />

      <TouchableOpacity
        style={[
          styles.button,
          registerMutation.isLoading && styles.buttonDisabled,
        ]}
        onPress={handleRegister}
        disabled={registerMutation.isLoading}
      >
        <Text style={styles.buttonText}>
          {registerMutation.isLoading
            ? "Creating Account..."
            : "Create Account"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={goToLogin}
        style={styles.loginLink}
        disabled={registerMutation.isLoading}
      >
        <Text style={styles.loginText}>
          Already have an account? Login here
        </Text>
      </TouchableOpacity>
    </View>
  );
}

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
  imagePickerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  imageContainer: {
    backgroundColor: "#f0f0f0",
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  defaultImageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  uploadText: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
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
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
