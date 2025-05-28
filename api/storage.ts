import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";

export const storeToken = async (token: string) => {
  console.log("🔐 Storage: Attempting to store token...");
  console.log("🔐 Storage: Platform:", Platform.OS);
  console.log(
    "🔐 Storage: Token to store:",
    token ? `${token.substring(0, 10)}...` : "null/undefined"
  );
  console.log("🔐 Storage: Token length:", token ? token.length : 0);

  if (!token) {
    throw new Error("Token is null or undefined");
  }

  try {
    // Try SecureStore first
    console.log("🔐 Storage: Trying SecureStore...");
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log("✅ Storage: Token stored in SecureStore successfully");

    // Immediate verification
    const verification = await SecureStore.getItemAsync(TOKEN_KEY);
    console.log(
      "🔍 Storage: SecureStore verification:",
      verification ? "✅ Found" : "❌ Not found"
    );

    if (verification) {
      return; // Success with SecureStore
    }
  } catch (secureError) {
    console.log(
      "⚠️ Storage: SecureStore failed, trying AsyncStorage fallback..."
    );
    console.log("SecureStore error:", secureError);
  }

  try {
    // Fallback to AsyncStorage
    console.log("🔐 Storage: Using AsyncStorage fallback...");
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log("✅ Storage: Token stored in AsyncStorage successfully");

    // Immediate verification
    const verification = await AsyncStorage.getItem(TOKEN_KEY);
    console.log(
      "🔍 Storage: AsyncStorage verification:",
      verification ? "✅ Found" : "❌ Not found"
    );
  } catch (asyncError) {
    console.error("❌ Storage: Both SecureStore and AsyncStorage failed!");
    console.error("AsyncStorage error:", asyncError);
    throw new Error(
      "Failed to store token in both SecureStore and AsyncStorage"
    );
  }
};

export const getToken = async () => {
  console.log("🔐 Storage: Attempting to retrieve token...");
  console.log("🔐 Storage: Platform:", Platform.OS);

  try {
    // Try SecureStore first
    console.log("🔐 Storage: Trying SecureStore...");
    const secureToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (secureToken) {
      console.log(
        "🔐 Storage: Retrieved from SecureStore:",
        `${secureToken.substring(0, 10)}...`
      );
      console.log("🔐 Storage: Token length:", secureToken.length);
      return secureToken;
    }
    console.log("🔐 Storage: No token in SecureStore, trying AsyncStorage...");
  } catch (secureError) {
    console.log(
      "⚠️ Storage: SecureStore retrieval failed, trying AsyncStorage..."
    );
    console.log("SecureStore error:", secureError);
  }

  try {
    // Fallback to AsyncStorage
    const asyncToken = await AsyncStorage.getItem(TOKEN_KEY);
    if (asyncToken) {
      console.log(
        "🔐 Storage: Retrieved from AsyncStorage:",
        `${asyncToken.substring(0, 10)}...`
      );
      console.log("🔐 Storage: Token length:", asyncToken.length);
      return asyncToken;
    }
    console.log("🔐 Storage: No token found in AsyncStorage either");
    return null;
  } catch (asyncError) {
    console.error("❌ Storage: AsyncStorage retrieval failed:", asyncError);
    return null;
  }
};

export const deleteToken = async () => {
  console.log("🔐 Storage: Attempting to delete token...");

  try {
    // Delete from both stores
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log("✅ Storage: Token deleted from SecureStore");
  } catch (secureError) {
    console.log("⚠️ Storage: SecureStore deletion failed:", secureError);
  }

  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log("✅ Storage: Token deleted from AsyncStorage");
  } catch (asyncError) {
    console.log("⚠️ Storage: AsyncStorage deletion failed:", asyncError);
  }
};
