import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { Card, Text, Colors, Button } from "react-native-ui-lib";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Appointment } from "@/types/appointment";
import { AvatarMenu } from "./ui/AvatarMenu";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onJoinMeeting?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: Colors.orange30,
  confirmed: Colors.green30,
  cancelled: Colors.red30,
};
const STATUS_LABELS: Record<string, string> = {
  pending: "PENDENTE",
  confirmed: "CONFIRMADO",
  cancelled: "CANCELADO",
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
  onCancel,
  onJoinMeeting,
}) => {
  const {
    professional_name,
    patient_name,
    start_time,
    status,
    patient_image_url,
    professional_image_url,
  } = appointment;
  const dt = new Date(start_time);
  const dateStr = dt.toLocaleDateString("pt-BR");
  const timeStr = dt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const badgeColor = STATUS_COLORS[status] ?? Colors.grey40;

  const handleCancelPress = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Tem certeza que deseja cancelar este agendamento?"
      );
      if (confirmed) {
        onCancel();
      }
    } else {
      Alert.alert(
        "Cancelar agendamento",
        "Tem certeza que deseja cancelar este agendamento?",
        [
          { text: "Não", style: "cancel" },
          { text: "Sim", style: "destructive", onPress: onCancel },
        ]
      );
    }
  };

  const isCancelled = status === "cancelled";
  const isConfirmed = status === "confirmed";

  // Check if appointment is within 15 minutes before or after start time
  const now = new Date();
  const appointmentTime = new Date(start_time);
  const timeDiff = appointmentTime.getTime() - now.getTime();
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  const canJoinMeeting = isConfirmed && minutesDiff <= 15 && minutesDiff >= -60;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ width: CARD_WIDTH }}
    >
      <View style={[styles.card, isCancelled && styles.cardCancelled]}>
        {/* Status Badge */}
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>
            {STATUS_LABELS[status] ?? status.toUpperCase()}
          </Text>
        </View>

        {/* Header with Icon */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <AvatarMenu
              imageUrl={
                professional_name ? professional_image_url : patient_image_url
              }
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>
              {professional_name || patient_name || "Consulta"}
            </Text>
            {professional_name && patient_name && (
              <Text style={styles.subtitle}>
                {professional_name
                  ? `Paciente: ${patient_name}`
                  : `Profissional: ${professional_name}`}
              </Text>
            )}
            <View style={styles.dateTimeContainer}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text style={styles.infoText}>{dateStr}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.infoText}>{timeStr}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Divider */}
        {!isCancelled && <View style={styles.divider} />}

        {/* Join Meeting Button - Only for confirmed appointments within time window */}
        {canJoinMeeting && onJoinMeeting && (
          <TouchableOpacity
            style={styles.joinMeetingButton}
            onPress={onJoinMeeting}
            activeOpacity={0.8}
          >
            <View style={styles.joinMeetingContent}>
              <Ionicons name="chatbubbles" size={24} color="#fff" />
              <Text style={styles.joinMeetingText}>Entrar no chat</Text>
            </View>
            {minutesDiff > 0 && (
              <Text style={styles.joinMeetingSubtext}>
                Inicia em {minutesDiff} min
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Actions */}
        {!isCancelled && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onPress}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={18} color="#4f46e5" />
              <Text style={styles.actionButtonText}>Ver detalhes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancelPress}
              style={[styles.actionButton, styles.cancelButton]}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#FFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: "relative",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  cardCancelled: {
    opacity: 0.7,
    backgroundColor: "#f9fafb",
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  iconContainer: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    paddingRight: 80,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 8,
  },
  dateTimeContainer: {
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 14,
  },
  joinMeetingButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  joinMeetingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  joinMeetingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  joinMeetingSubtext: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#ede9fe",
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "#fee2e2",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4f46e5",
  },
  cancelButtonText: {
    color: "#ef4444",
  },
});
