import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Appointment } from "@/types/appointment";
import {
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
} from "@/api/appointment";
import { useAuth } from "@/hooks/useAuth";
import { AvatarMenu } from "@/components/ui/AvatarMenu";
import { Avatar } from "@/components/ui/Avatar";

type AppointmentDetailRouteProp = RouteProp<
  { AppointmentDetail: { appointment: Appointment } },
  "AppointmentDetail"
>;

const STATUS_COLORS: Record<string, [string, string]> = {
  pending: ["#f59e0b", "#d97706"],
  confirmed: ["#10b981", "#059669"],
  cancelled: ["#ef4444", "#dc2626"],
  completed: ["#6366f1", "#4f46e5"],
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "time-outline",
  confirmed: "checkmark-circle-outline",
  cancelled: "close-circle-outline",
  completed: "checkmark-done-circle-outline",
};

export default function AppointmentDetailScreen() {
  const route = useRoute<AppointmentDetailRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { appointment } = route.params;

  const dt = new Date(appointment.start_time);
  const dateStr = dt.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = dt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusColors = STATUS_COLORS[appointment.status] || [
    "#6b7280",
    "#4b5563",
  ];
  const isCancelled = appointment.status === "cancelled";
  const isPending = appointment.status === "pending";
  const isConfirmed = appointment.status === "confirmed";
  const isCompleted = appointment.status === "completed";
  const isProfessional = user?.role === "professional";

  // Check if appointment is within time window for joining
  const now = new Date();
  const appointmentTime = new Date(appointment.start_time);
  const timeDiff = appointmentTime.getTime() - now.getTime();
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  const canJoinMeeting = isConfirmed && minutesDiff <= 15 && minutesDiff >= -60;

  const handleCancelAppointment = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Tem certeza que deseja cancelar este agendamento?"
      );
      if (confirmed) {
        cancelAppointmentAsync();
      }
    } else {
      Alert.alert(
        "Cancelar Agendamento",
        "Tem certeza que deseja cancelar este agendamento?",
        [
          { text: "Não", style: "cancel" },
          {
            text: "Sim",
            style: "destructive",
            onPress: cancelAppointmentAsync,
          },
        ]
      );
    }
  };

  const cancelAppointmentAsync = async () => {
    try {
      await cancelAppointment(appointment.id);
      Alert.alert("Sucesso", "Agendamento cancelado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      Alert.alert("Erro", "Não foi possível cancelar o agendamento.");
    }
  };

  const handleCompleteAppointment = () => {
    Alert.alert(
      "Finalizar Consulta",
      "Deseja marcar esta consulta como concluída?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim",
          style: "default",
          onPress: completeAppointmentAsync,
        },
      ]
    );
  };

  const completeAppointmentAsync = async () => {
    try {
      await completeAppointment(appointment.id);
      Alert.alert("Sucesso", "Consulta finalizada com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error("Error completing appointment:", error);
      Alert.alert("Erro", "Não foi possível finalizar a consulta.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={statusColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.statusIconContainer}>
              <Ionicons
                name={STATUS_ICONS[appointment.status] as any}
                size={48}
                color="#fff"
              />
            </View>
            <Text style={styles.headerTitle}>
              {STATUS_LABELS[appointment.status]}
            </Text>
            <Text style={styles.headerSubtitle}>Detalhes do Agendamento</Text>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Professional Info Card */}
          {appointment.professional_name && (
            <View style={styles.professionalCard}>
              <View style={styles.professionalCardGradient}>
                <View style={styles.professionalCardHeader}>
                  <View style={styles.professionalAvatarContainer}>
                    <Ionicons name="medkit" size={32} color="#fff" />
                  </View>
                  <View style={styles.professionalCardContent}>
                    <Text style={styles.professionalCardLabel}>
                      Profissional
                    </Text>
                    <Text style={styles.professionalCardName}>
                      {appointment.professional_name}
                    </Text>
                  </View>
                </View>
                <View style={styles.professionalCardDecoration}>
                  <Ionicons
                    name="medical"
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Patient Info Card */}
          {appointment.patient_name && (
            <View style={styles.patientCard}>
              <View style={styles.patientCardGradient}>
                <View style={styles.patientCardHeader}>
                  <View style={styles.patientAvatarContainer}>
                    <Avatar
                      imageUrl={appointment.patient_image_url}
                      size={48}
                    />
                  </View>
                  <View style={styles.patientCardContent}>
                    <Text style={styles.patientCardLabel}>Paciente</Text>
                    <Text style={styles.patientCardName}>
                      {appointment.patient_name}
                    </Text>
                  </View>
                </View>
                <View style={styles.patientCardDecoration}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Date & Time Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="calendar" size={24} color="#4f46e5" />
              </View>
              <Text style={styles.cardTitle}>Data e Horário</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={20} color="#6b7280" />
              <Text style={styles.infoText}>{dateStr}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="access-time" size={20} color="#6b7280" />
              <Text style={styles.infoText}>{timeStr}</Text>
            </View>
          </View>

          {/* Appointment Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="information-circle" size={24} color="#4f46e5" />
              </View>
              <Text style={styles.cardTitle}>Informações</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ID do Agendamento</Text>
              <Text style={styles.detailValue}>#{appointment.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColors[0] },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {STATUS_LABELS[appointment.status]}
                </Text>
              </View>
            </View>
          </View>

          {/* Chat Button - Only for confirmed appointments */}
          {appointment.status === "confirmed" && (
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => {
                (navigation as any).navigate("Chat", { appointment });
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubbles" size={24} color="#fff" />
              <Text style={styles.chatButtonText}>Entrar no Chat</Text>
            </TouchableOpacity>
          )}

          {/* Actions */}
          {!isCancelled && !isCompleted && (
            <View style={styles.actionsContainer}>
              {/* Confirm Button - Only for pending appointments by professionals */}
              {isPending && isProfessional && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={async () => {
                    Alert.alert(
                      "Confirmar Agendamento",
                      "Deseja confirmar este agendamento?",
                      [
                        { text: "Não", style: "cancel" },
                        {
                          text: "Confirmar",
                          onPress: async () => {
                            try {
                              await confirmAppointment(appointment.id);
                              Alert.alert("Sucesso", "Agendamento confirmado!");
                              navigation.goBack();
                            } catch (error) {
                              console.error(
                                "Error confirming appointment:",
                                error
                              );
                              Alert.alert(
                                "Erro",
                                "Não foi possível confirmar o agendamento."
                              );
                            }
                          },
                        },
                      ]
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.confirmButtonText}>
                    Confirmar Agendamento
                  </Text>
                </TouchableOpacity>
              )}

              {/* Complete Button - Only for confirmed appointments by professionals */}
              {isConfirmed && isProfessional && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleCompleteAppointment}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="checkmark-done-circle-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.completeButtonText}>
                    Finalizar Consulta
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelAppointment}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.cancelButtonText}>
                  Cancelar Agendamento
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Help Section */}
          <View style={styles.helpCard}>
            <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Precisa de ajuda?</Text>
              <Text style={styles.helpText}>
                Entre em contato com o suporte para mais informações sobre seu
                agendamento.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  professionalName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4f46e5",
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  joinMeetingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 18,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  joinMeetingButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,

    borderRadius: 16,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 8,
    gap: 12,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  rescheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  rescheduleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  helpCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  patientCard: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: "hidden",
  },
  patientCardGradient: {
    backgroundColor: "#667eea",
    padding: 24,
    position: "relative",
  },
  patientCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  patientAvatarContainer: {
    marginRight: 16,
  },
  patientCardContent: {
    flex: 1,
  },
  patientCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  patientCardName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 28,
  },
  patientCardDecoration: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  professionalCard: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: "hidden",
  },
  professionalCardGradient: {
    backgroundColor: "#10b981",
    padding: 24,
    position: "relative",
  },
  professionalCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  professionalAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  professionalCardContent: {
    flex: 1,
  },
  professionalCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  professionalCardName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 28,
  },
  professionalCardDecoration: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
});
