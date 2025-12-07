import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useAuth } from "@/hooks/useAuth";
import { Appointment } from "@/types/appointment";
import { getMyAppointments } from "@/api/appointment";

interface ConversationItem {
  appointment: Appointment;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  specialty?: string;
}

export default function ConversationsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const appointments = await getMyAppointments();

      // Show all appointments with potential chat history (not just confirmed)
      // Users can view old conversations even if appointment status changed
      const appointmentsWithChat = appointments;

      // Transform appointments into conversation items
      const conversationItems: ConversationItem[] = appointmentsWithChat.map(
        (appointment: Appointment) => {
          const isPatient = user?.role === "patient";
          const otherUserName = isPatient
            ? appointment.professional_name || "Profissional"
            : appointment.patient_name || "Paciente";

          // Generate avatar from first letter of name
          const otherUserAvatar = otherUserName.charAt(0).toUpperCase();

          return {
            appointment,
            otherUserName,
            otherUserAvatar,
            specialty: isPatient ? "Consulta médica" : undefined,
            // TODO: Add last message and unread count from backend
            lastMessage:
              appointment.status === "confirmed"
                ? "Toque para iniciar conversa"
                : "Toque para ver histórico",
            lastMessageTime: new Date(
              appointment.start_time
            ).toLocaleDateString("pt-BR"),
          };
        }
      );

      setConversations(conversationItems);
    } catch (error) {
      console.error("Error loading conversations:", error);
      Alert.alert("Erro", "Não foi possível carregar as conversas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.role]);

  // Load conversations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.specialty &&
        conv.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const navigateToChat = (conversation: ConversationItem) => {
    (navigation as any).navigate("Chat", {
      appointment: conversation.appointment,
    });
  };

  const renderConversationItem = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigateToChat(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: getAvatarColor(item.otherUserAvatar) },
          ]}
        >
          <Text style={styles.avatarText}>{item.otherUserAvatar}</Text>
        </View>
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName}>{item.otherUserName}</Text>
          <View style={styles.statusContainer}>
            {item.appointment.status === "confirmed" ? (
              <View style={styles.confirmedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#22c55e" />
              </View>
            ) : (
              <View style={styles.pendingBadge}>
                <Ionicons name="time" size={12} color="#f59e0b" />
              </View>
            )}
            <Text style={styles.timestamp}>{item.lastMessageTime}</Text>
          </View>
        </View>

        {item.specialty && (
          <Text style={styles.specialty}>{item.specialty}</Text>
        )}

        <Text style={styles.lastMessage}>
          {item.lastMessage}
          {item.appointment.status !== "confirmed" && (
            <Text style={styles.readOnlyIndicator}> • Somente leitura</Text>
          )}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const getAvatarColor = (letter: string) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
    ];
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Conversas</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando conversas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          {filteredConversations.length}{" "}
          {user?.role === "patient" ? "conversas" : "conversas"} disponíveis
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar conversa..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.appointment.id.toString()}
        renderItem={renderConversationItem}
        style={styles.conversationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              Nenhuma conversa encontrada.{"\n"}
              As conversas aparecem aqui quando você tem consultas agendadas.
            </Text>
            {searchQuery ? (
              <Text style={styles.emptySubtitle}>
                Tente buscar por outro termo
              </Text>
            ) : (
              <Text style={styles.emptySubtitle}>
                Você ainda não possui consultas agendadas para conversar
              </Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#212529",
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#dc3545",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
  },
  timestamp: {
    fontSize: 12,
    color: "#6c757d",
  },
  specialty: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "500",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6c757d",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  confirmedBadge: {
    marginRight: 4,
  },
  pendingBadge: {
    marginRight: 4,
  },
  readOnlyIndicator: {
    fontSize: 12,
    color: "#f59e0b",
    fontStyle: "italic",
  },
});
