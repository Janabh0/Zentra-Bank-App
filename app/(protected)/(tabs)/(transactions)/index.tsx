import { API_CONFIG, buildUrl } from "@/api/config";
import { getToken } from "@/api/storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  createdAt: string;
  from?: {
    username: string;
  };
  to?: {
    username: string;
  };
}

type FilterType = "all" | "deposit" | "withdraw" | "transfer";
type ActionType = "deposit" | "withdraw" | "transfer" | null;

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const [modalVisible, setModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType>(null);
  const [amount, setAmount] = useState("");
  const [username, setUsername] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(
        (transaction) => transaction.type === activeFilter
      );
      setFilteredTransactions(filtered);
    }
  }, [activeFilter, transactions]);

  const fetchTransactions = async () => {
    try {
      const token = await getToken();

      if (!token) {
        router.replace("/(auth)/Login");
        return;
      }

      const url = buildUrl(API_CONFIG.ENDPOINTS.MY_TRANSACTIONS);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransactions(response.data);
      setFilteredTransactions(response.data);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to load transactions";
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleActionPress = (action: ActionType) => {
    setCurrentAction(action);
    setAmount("");
    setUsername("");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentAction(null);
    setAmount("");
    setUsername("");
    setActionLoading(false);
  };

  const handleActionSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount greater than 0"
      );
      return;
    }

    if (currentAction === "transfer" && !username.trim()) {
      Alert.alert("Invalid Username", "Please enter a username to transfer to");
      return;
    }

    setActionLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        setActionLoading(false);
        return;
      }

      let url = "";
      let data: { amount: number; username?: string } = {
        amount: Number(amount),
      };

      switch (currentAction) {
        case "deposit":
          url = buildUrl(API_CONFIG.ENDPOINTS.DEPOSIT);
          break;
        case "withdraw":
          url = buildUrl(API_CONFIG.ENDPOINTS.WITHDRAW);
          break;
        case "transfer":
          url = buildUrl(`${API_CONFIG.ENDPOINTS.TRANSFER}/${username.trim()}`);
          data.username = username.trim();
          break;
        default:
          Alert.alert("Error", "Invalid action");
          setActionLoading(false);
          return;
      }

      const response = await axios.put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      closeModal();

      Alert.alert(
        "Success",
        `${currentAction?.charAt(0).toUpperCase()}${currentAction?.slice(
          1
        )} of $${amount} completed successfully!`
      );

      await fetchTransactions();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        `Failed to ${currentAction}`;
      Alert.alert("Error", errorMessage);
      setActionLoading(false);
    }
  };

  const renderFilterTab = (filter: FilterType, label: string) => {
    const isActive = activeFilter === filter;
    return (
      <TouchableOpacity
        key={filter}
        style={[styles.filterTab, isActive && styles.activeFilterTab]}
        onPress={() => setActiveFilter(filter)}
      >
        <Text
          style={[styles.filterTabText, isActive && styles.activeFilterTabText]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderActionModal = () => {
    if (!currentAction) return null;

    const actionConfig = {
      deposit: { title: "Deposit Money", icon: "+", color: "#28a745" },
      withdraw: { title: "Withdraw Money", icon: "-", color: "#dc3545" },
      transfer: { title: "Transfer Money", icon: "→", color: "#dc3545" },
    };

    const config = actionConfig[currentAction];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalIconContainer,
                  { backgroundColor: config.color },
                ]}
              >
                <Text style={styles.modalIcon}>{config.icon}</Text>
              </View>
              <Text style={styles.modalTitle}>{config.title}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
                autoFocus
              />
            </View>

            {currentAction === "transfer" && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
                disabled={actionLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { backgroundColor: config.color },
                ]}
                onPress={handleActionSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    {config.title.split(" ")[0]}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getTransactionDetails = () => {
      switch (item.type) {
        case "deposit":
          return {
            text: "Deposit",
            amount: `+$${item.amount.toFixed(2)}`,
            color: "#28a745",
            icon: "+",
            borderColor: "#28a745",
          };
        case "withdraw":
          return {
            text: "Withdrawal",
            amount: `-$${item.amount.toFixed(2)}`,
            color: "#dc3545",
            icon: "-",
            borderColor: "#dc3545",
          };
        case "transfer":
          if (item.from) {
            return {
              text: `Transfer from ${item.from.username}`,
              amount: `+$${item.amount.toFixed(2)}`,
              color: "#dc3545",
              icon: "↓",
              borderColor: "#dc3545",
            };
          } else if (item.to) {
            return {
              text: `Transfer to ${item.to.username}`,
              amount: `-$${item.amount.toFixed(2)}`,
              color: "#dc3545",
              icon: "↑",
              borderColor: "#dc3545",
            };
          }
          return {
            text: "Transfer",
            amount: `$${item.amount.toFixed(2)}`,
            color: "#dc3545",
            icon: "→",
            borderColor: "#dc3545",
          };
        default:
          return {
            text: item.type,
            amount: `$${item.amount.toFixed(2)}`,
            color: "#6c757d",
            icon: "•",
            borderColor: "#6c757d",
          };
      }
    };

    const details = getTransactionDetails();

    return (
      <View
        style={[
          styles.transactionItem,
          { borderLeftColor: details.borderColor },
        ]}
      >
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.transactionIconContainer,
              { backgroundColor: details.color },
            ]}
          >
            <Text style={styles.transactionIcon}>{details.icon}</Text>
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionText}>{details.text}</Text>
            <Text style={styles.transactionDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, { color: details.color }]}>
          {details.amount}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.subtitle}>Check console for details</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.transferButton]}
          onPress={() => handleActionPress("transfer")}
        >
          <Text style={styles.actionButtonIcon}>→</Text>
          <Text style={styles.actionButtonText}>Transfer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.depositButton]}
          onPress={() => handleActionPress("deposit")}
        >
          <Text style={styles.actionButtonIcon}>+</Text>
          <Text style={styles.actionButtonText}>Deposit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.withdrawButton]}
          onPress={() => handleActionPress("withdraw")}
        >
          <Text style={styles.actionButtonIcon}>-</Text>
          <Text style={styles.actionButtonText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterTab("all", "All")}
        {renderFilterTab("deposit", "Deposits")}
        {renderFilterTab("withdraw", "Withdrawals")}
        {renderFilterTab("transfer", "Transfers")}
      </View>

      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {activeFilter === "all"
              ? "No transactions found"
              : `No ${activeFilter} transactions found`}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeFilter === "all"
              ? "Your transaction history will appear here"
              : `Your ${activeFilter} history will appear here`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {renderActionModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
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
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    marginBottom: 10,
    textAlign: "center",
  },

  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transferButton: {
    backgroundColor: "#007AFF",
  },
  depositButton: {
    backgroundColor: "#28a745",
  },
  withdrawButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  activeFilterTab: {
    backgroundColor: "#007AFF",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeFilterTabText: {
    color: "#fff",
  },

  listContainer: {
    paddingBottom: 20,
  },
  transactionItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionIcon: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: "#666",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  modalIcon: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#28a745",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
