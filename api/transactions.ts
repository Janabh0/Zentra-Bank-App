import instance from "./index";

interface Transaction {
  id: string;
  amount: number;
  type: "deposit" | "withdraw" | "transfer";
  sender?: string;
  recipient?: string;
  createdAt: string;
}

// Get user transactions
export const getMyTransactions = async () => {
  const { data } = await instance.get("transactions/my");
  return data as Transaction[];
};

// Deposit money
export const deposit = async (amount: number) => {
  const { data } = await instance.put("transactions/deposit", { amount });
  return data;
};

// Withdraw money
export const withdraw = async (amount: number) => {
  const { data } = await instance.put("transactions/withdraw", { amount });
  return data;
};

// Transfer money
export const transfer = async (username: string, amount: number) => {
  const { data } = await instance.put(`transactions/transfer/${username}`, {
    amount,
  });
  return data;
};
