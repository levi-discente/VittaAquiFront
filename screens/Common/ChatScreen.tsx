import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Appointment } from "@/types/appointment";
import { useAuth } from "@/hooks/useAuth";
import {
  getAppointmentMessages,
  uploadChatFile,
  BackendChatMessage,
} from "@/api/chat";
// import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

type ChatScreenRouteProp = RouteProp<
  { Chat: { appointment: Appointment } },
  "Chat"
>;

interface ChatMessage {
  id: number;
  content: string;
  sender_user_id: number;
  sender_name: string;
  sender_image_url?: string;
  created_at: string;
  isOwn: boolean;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
}

// Configuration - adjust these based on your backend URL
const WS_BASE_URL = "wss://vittaaqui.onrender.com";

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const { appointment } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Check if chat should be read-only (when appointment is not confirmed)
  const isReadOnly = appointment.status !== "confirmed";

  // Convert backend message to chat format
  const backendToChat = useCallback(
    (msg: BackendChatMessage): ChatMessage => {
      return {
        id: msg.id,
        content: msg.content,
        sender_user_id: msg.sender_user_id,
        sender_name: msg.sender_name,
        sender_image_url: msg.sender_image_url,
        created_at: msg.created_at,
        isOwn: msg.sender_user_id === Number(user?.id),
        file_url: msg.file_url,
        file_name: msg.file_name,
        file_type: msg.file_type,
        file_size: msg.file_size,
      };
    },
    [user?.id]
  );

  // Load message history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        console.log("Loading chat history for appointment:", appointment.id);
        const data = await getAppointmentMessages(appointment.id);
        console.log("Chat history loaded:", data);
        const mapped = data.map(backendToChat);
        setMessages(mapped);
      } catch (error: any) {
        // Don't show error alert for empty chat history (404 is expected for new chats)
        if (error.response?.status === 404) {
          console.log(
            "No chat history found (404) - this is normal for new conversations"
          );
          setMessages([]);
        } else {
          Alert.alert(
            "Erro",
            `Não foi possível carregar o histórico do chat: ${
              error.response?.data?.detail || error.message
            }`
          );
        }
      }
    };

    loadHistory();
  }, [appointment.id, backendToChat]);

  // WebSocket connection (only for confirmed appointments)
  useEffect(() => {
    if (!token || isReadOnly) {
      setIsConnected(true); // Set as connected for UI purposes
      return;
    }

    const connectWebSocket = () => {
      const wsUrl = `${WS_BASE_URL}/ws/chat/${appointment.id}?token=${token}`;
      console.log("Attempting WebSocket connection to:", wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected successfully");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Handle error messages
          if (msg.error) {
            Alert.alert("Erro", msg.error);
            return;
          }

          // Convert and add new message
          const chatMsg = backendToChat(msg);
          setMessages((prev) => [...prev, chatMsg]);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log(
          "❌ WebSocket closed - Code:",
          event.code,
          "Reason:",
          event.reason || "No reason provided"
        );
        setIsConnected(false);

        // Don't reconnect on authentication failures (1008) or forbidden (1006 with 403)
        if (
          event.code === 1008 ||
          (event.code === 1006 && event.reason?.includes("403"))
        ) {
          console.error(
            "🚫 Authentication or authorization failed. Not reconnecting."
          );
          Alert.alert(
            "Connection Error",
            "Unable to connect to chat. Please check your authentication or try logging in again."
          );
          return;
        }

        // Attempt to reconnect after 3 seconds if not manually closed
        if (event.code !== 1000) {
          console.log("🔄 Will attempt to reconnect in 3 seconds...");
          setTimeout(connectWebSocket, 3000);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
        wsRef.current = null;
      }
    };
  }, [appointment.id, token, backendToChat, isReadOnly]);

  // Hide default navigation header since we have a custom one
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Send message function (only for confirmed appointments)
  const sendMessage = useCallback(() => {
    if (!inputText.trim() || isReadOnly) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      Alert.alert("Erro", "Conexão perdida. Tentando reconectar...");
      return;
    }

    const wsMessage = {
      content: inputText.trim(),
      temp_id: Date.now().toString(),
    };

    ws.send(JSON.stringify(wsMessage));
    setInputText("");
  }, [inputText, isReadOnly]);

  // File picker function
  const pickFile = async () => {
    try {
      Alert.alert(
        "Anexar Arquivo",
        "Escolha o tipo de arquivo que deseja enviar:",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Galeria",
            onPress: pickImage,
          },
          {
            text: "Documentos",
            onPress: pickDocument,
          },
        ]
      );
    } catch (error) {
      console.error("Error picking file:", error);
      Alert.alert("Erro", "Não foi possível selecionar o arquivo");
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar sua galeria de fotos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem");
    }
  };

  const pickDocument = async () => {
    try {
      // Temporarily use image picker for documents until DocumentPicker is fixed
      Alert.alert(
        "Seleção de Documentos",
        "Por enquanto, use a opção 'Galeria' para enviar arquivos. Seleção de documentos será habilitada em breve!",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Erro", "Não foi possível selecionar o documento");
    }
  };

  const uploadFile = async (file: any) => {
    try {
      console.log("Uploading file:", file);

      // Show loading state
      Alert.alert("Enviando...", "Fazendo upload do arquivo...");

      // Create file object for upload
      const fileToUpload = {
        uri: file.uri,
        type: file.mimeType || file.type || "application/octet-stream",
        name: file.name || "file",
      };

      // Upload file to backend
      const uploadResult = await uploadChatFile(appointment.id, fileToUpload);

      // Send message with file attachment via WebSocket
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        const wsMessage = {
          content: file.name || "Arquivo anexado",
          temp_id: Date.now().toString(),
          file_url: uploadResult.file_url,
          file_name: uploadResult.file_name,
          file_type: uploadResult.file_type,
          file_size: uploadResult.file_size,
        };

        ws.send(JSON.stringify(wsMessage));
        Alert.alert("Sucesso", "Arquivo enviado com sucesso!");
      } else {
        Alert.alert("Erro", "Conexão perdida. Tente novamente.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert(
        "Erro",
        "Não foi possível enviar o arquivo. Verifique sua conexão."
      );
    }
  };

  // Helper functions for file handling
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType?: string): any => {
    if (!fileType) return "document-outline";

    if (fileType.startsWith("image/")) return "image-outline";
    if (fileType.startsWith("video/")) return "videocam-outline";
    if (fileType.startsWith("audio/")) return "musical-notes-outline";
    if (fileType.includes("pdf")) return "document-text-outline";
    if (fileType.includes("word") || fileType.includes("document"))
      return "document-outline";
    if (fileType.includes("excel") || fileType.includes("spreadsheet"))
      return "grid-outline";
    if (fileType.includes("zip") || fileType.includes("rar"))
      return "archive-outline";

    return "document-outline";
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.isOwn ? styles.ownMessageBubble : styles.otherMessageBubble,
        ]}
      >
        {!item.isOwn && (
          <Text style={styles.senderName}>{item.sender_name}</Text>
        )}

        {/* File attachment */}
        {item.file_url && (
          <TouchableOpacity
            style={styles.fileAttachment}
            onPress={() => {
              Alert.alert(
                "Arquivo",
                `${item.file_name}\nTamanho: ${formatFileSize(
                  item.file_size || 0
                )}`,
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Abrir",
                    onPress: () => {
                      // TODO: Implement file opening/downloading
                      Alert.alert(
                        "Em breve",
                        "Abertura de arquivos será implementada em breve!"
                      );
                    },
                  },
                ]
              );
            }}
          >
            <View style={styles.fileIcon}>
              <Ionicons
                name={getFileIcon(item.file_type)}
                size={24}
                color={item.isOwn ? "#fff" : "#007AFF"}
              />
            </View>
            <View style={styles.fileInfo}>
              <Text
                style={[
                  styles.fileName,
                  item.isOwn ? styles.ownText : styles.otherText,
                ]}
              >
                {item.file_name}
              </Text>
              <Text
                style={[
                  styles.fileSize,
                  item.isOwn ? styles.ownText : styles.otherText,
                ]}
              >
                {formatFileSize(item.file_size || 0)}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Text content */}
        {item.content && (
          <Text
            style={[
              styles.messageText,
              item.isOwn ? styles.ownText : styles.otherText,
            ]}
          >
            {item.content}
          </Text>
        )}

        <Text
          style={[
            styles.timestamp,
            item.isOwn ? styles.ownTimestamp : styles.otherTimestamp,
          ]}
        >
          {new Date(item.created_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.role === "patient"
                  ? appointment.professional_name
                  : appointment.patient_name
                )
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </Text>
            </View>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>
              {user?.role === "patient"
                ? appointment.professional_name
                : appointment.patient_name}
            </Text>
          </View>
        </View>
      </View>

      {/* Appointment Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusBadge}>
          <Ionicons
            name={
              appointment.status === "confirmed" ? "checkmark-circle" : "time"
            }
            size={16}
            color={appointment.status === "confirmed" ? "#22c55e" : "#f59e0b"}
          />
          <Text style={styles.statusText}>
            {appointment.status === "confirmed"
              ? "Consulta Confirmada"
              : `Consulta ${appointment.status}`}
          </Text>
        </View>
        <Text style={styles.statusDate}>
          {new Date(appointment.start_time).toLocaleDateString("pt-BR")} às{" "}
          {new Date(appointment.start_time).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      {/* Messages Area */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Connection status */}
        {!isConnected && !isReadOnly && (
          <View style={styles.connectionStatus}>
            <Text style={styles.connectionText}>Reconectando...</Text>
          </View>
        )}

        {/* Messages list */}
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
            </View>
            <Text style={styles.emptyTitle}>Nenhuma mensagem ainda</Text>
            <Text style={styles.emptySubtitle}>
              {isReadOnly
                ? "Não há mensagens nesta conversa"
                : "Envie uma mensagem para começar a conversa"}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input area */}
        <View style={styles.inputContainer}>
          {isReadOnly ? (
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>
                🔒 Chat disponível apenas para consultas confirmadas
              </Text>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.attachButton} onPress={pickFile}>
                <Ionicons name="attach" size={24} color="#007AFF" />
              </TouchableOpacity>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Digite sua mensagem..."
                  multiline={false}
                  maxLength={1000}
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  // New Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  // Status Styles
  statusContainer: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
    marginLeft: 6,
  },
  statusDate: {
    fontSize: 12,
    color: "#666",
  },
  // Chat Container
  chatContainer: {
    flex: 1,
  },
  connectionStatus: {
    backgroundColor: "#ff9500",
    padding: 8,
    alignItems: "center",
  },
  connectionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  // Messages
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: "100%",
    paddingHorizontal: 8,
  },
  ownMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginVertical: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMessageBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: "#fff",
  },
  otherText: {
    color: "#333",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  ownTimestamp: {
    color: "#fff",
    opacity: 0.8,
  },
  otherTimestamp: {
    color: "#666",
    alignSelf: "flex-end",
  },
  // Input Styles
  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    marginRight: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    minHeight: 44,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  readOnlyInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  readOnlyText: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  // File attachment styles
  fileAttachment: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  fileIcon: {
    marginRight: 8,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
  },
  fileSize: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
});
