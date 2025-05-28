import { instance } from ".";
import { deleteToken, storeToken } from "./storage";

const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const response = await instance.post("/auth/login", {
    username,
    password,
  });
  await storeToken(response.data.token);
  return response;
};

const register = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const response = await instance.post("/auth/register", {
    username,
    password,
  });
  return response;
};

const logout = async () => {
  await deleteToken();
  return { success: true };
};

const getMyProfile = async () => {
  const response = await instance.get("/auth/me");
  return response;
};

export { getMyProfile, login, logout, register };
api -> config 
export const API_CONFIG = {
  BASE_URL: "https://react-bank-project.eapi.joincoded.com",
  ENDPOINTS: {
    // Auth endpoints
    REGISTER: "/mini-project/api/auth/register",
    LOGIN: "/mini-project/api/auth/login",
    ME: "/mini-project/api/auth/me",
    USERS: "/mini-project/api/auth/users",
    USER_BY_ID: "/mini-project/api/auth/user", // append /<userId>
    UPDATE_PROFILE: "/mini-project/api/auth/profile",
    
    // Transaction endpoints
    MY_TRANSACTIONS: "/mini-project/api/transactions/my",
    DEPOSIT: "/mini-project/api/transactions/deposit",
    WITHDRAW: "/mini-project/api/transactions/withdraw",
    TRANSFER: "/mini-project/api/transactions/transfer", // append /<username>
  }
};

// Helper function to build full URL
export const buildUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`; 