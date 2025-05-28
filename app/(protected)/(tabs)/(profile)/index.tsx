import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../../../../context/AuthContext";

let getToken: any;
let deleteToken: any;
let API_CONFIG: any;
let buildUrl: any;
let axios: any;
let useRouter: any;

try {
  const storageModule = require("@/api/storage");
  getToken = storageModule.getToken;
  deleteToken = storageModule.deleteToken;
} catch (error) {
}

try {
  const configModule = require("@/api/config");
  API_CONFIG = configModule.API_CONFIG;
  buildUrl = configModule.buildUrl;
} catch (error) {
}

try {
  axios = require("axios").default;
} catch (error) {
}

try {
  const routerModule = require("expo-router");
  useRouter = routerModule.useRouter;
} catch (error) {
}

interface ProfileData {
  username: string;
  image?: string;
  balance: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const isFocused = useIsFocused();
  
  const hasRequiredImports = getToken && API_CONFIG && buildUrl && axios && useRouter;
  
  const router = hasRequiredImports ? useRouter() : null;

  const handleLogout = async () => {
    try {
      if (deleteToken) {
        await deleteToken();
      }
      
      setIsAuthenticated(false);
      
    } catch (error) {
      Alert.alert("Error", "Failed to logout properly");
    }
  };

  const fetchProfile = async (isRefresh = false) => {
    if (!hasRequiredImports) {
      setError("Missing required dependencies");
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const token = await getToken();
      
      if (!token) {
        if (router) {
          router.replace("/(auth)/Login");
        }
        return;
      }

      const url = buildUrl(API_CONFIG.ENDPOINTS.ME);
      
      const response = await axios.get(url, {
        headers: {
          Authorization: Bearer ${token},
        },
      });

      setProfile(response.data);
      setError(null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || "Failed to load profile";
      setError(errorMessage);
      if (!isRefresh) {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchProfile(true);
  };

  useEffect(() => {
    if (hasRequiredImports && isFocused) {
      fetchProfile();
    }
  }, [hasRequiredImports, isFocused]);

  if (!hasRequiredImports) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Import Error</Text>
        <Text style={styles.subtitle}>Some dependencies failed to load</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={styles.center}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.subtitle}>Pull down to refresh</Text>
      </ScrollView>
    );
  }

  if (!profile) {
    return (
      <ScrollView
        contentContainerStyle={styles.center}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>No profile data found</Text>
        <Text style={styles.subtitle}>Pull down to refresh</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {profile.image ? (
        <Image source={{ uri: profile.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>
            {profile.username.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={styles.username}>{profile.username}</Text>
      <Text style={styles.balance}>Balance: ${profile.balance.toFixed(2)}</Text>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  error: {
    fontSize: 14,
    color: "#dc3545",
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    marginBottom: 10,
    textAlign: "center",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  placeholder: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 48,
    color: "#fff",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  balance: {
    fontSize: 18,
    color: "#555",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});