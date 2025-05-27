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
