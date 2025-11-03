import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Appointment } from "@/types/appointment";
import { getPatientAppointments } from "@/api/appointment";

type PatientHistoryRouteProp = RouteProp<
  { PatientHistory: { patientId: number; patientName: string } },
  "PatientHistory"
>;

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  cancelled: "#ef4444",
  completed: "#6366f1",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Concluído",
};

export default function PatientHistoryScreen() {
  const route = useRoute<PatientHistoryRouteProp>();
  const navigation = useNavigation();
  const { patientId, patientName } = route.params;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPatientHistory();
  }, [patientId]);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPatientAppointments(patientId);
      // Sort by date, most recent first
      const sorted = data.sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
      setAppointments(sorted);
    } catch (err) {
      console.error("Error fetching patient history:", err);
      setError("Não foi possível carregar o histórico do paciente");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getPatientAppointments(patientId);
      const sorted = data.sort(
        (a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      );
      setAppointments(sorted);
      setError(null);
    } catch (err) {
      console.error("Error refreshing patient history:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const dt = new Date(dateString);
    return dt.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const dt = new Date(dateString);
    return dt.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAppointmentStats = () => {
    const total = appointments.length;
    const completed = appointments.filter(
      (a) => a.status === "completed"
    ).length;
    const confirmed = appointments.filter(
      (a) => a.status === "confirmed"
    ).length;
    const cancelled = appointments.filter(
      (a) => a.status === "cancelled"
    ).length;

    return { total, completed, confirmed, cancelled };
  };

  const stats = getAppointmentStats();

  return (
    <View style={styles.container}>
      {/* Header */}

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f46e5"]}
            tintColor="#4f46e5"
          />
        }
      >
        <LinearGradient
          colors={["#4f46e5", "#6366f1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.patientIconContainer}>
              <Ionicons name="person" size={48} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>{patientName}</Text>
            <Text style={styles.headerSubtitle}>Histórico de Consultas</Text>
          </View>
        </LinearGradient>
        <View style={styles.content}>
          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: "#ede9fe" }]}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#d1fae5" }]}>
              <Text style={[styles.statNumber, { color: "#10b981" }]}>
                {stats.completed}
              </Text>
              <Text style={styles.statLabel}>Concluídas</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#fee2e2" }]}>
              <Text style={[styles.statNumber, { color: "#ef4444" }]}>
                {stats.cancelled}
              </Text>
              <Text style={styles.statLabel}>Canceladas</Text>
            </View>
          </View>

          {/* Appointments List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text style={styles.loadingText}>Carregando histórico...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchPatientHistory}
              >
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : appointments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>
                Nenhuma consulta encontrada para este paciente
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.listHeader}>
                <MaterialIcons name="history" size={24} color="#4f46e5" />
                <Text style={styles.listTitle}>
                  Histórico de Consultas ({appointments.length})
                </Text>
              </View>

              {appointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  style={styles.appointmentCard}
                  onPress={() => {
                    (navigation as any).navigate("AppointmentDetail", {
                      appointment,
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.appointmentHeader}>
                    <View style={styles.appointmentDateContainer}>
                      <Text style={styles.appointmentDate}>
                        {formatDate(appointment.start_time)}
                      </Text>
                      <Text style={styles.appointmentTime}>
                        {formatTime(appointment.start_time)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            STATUS_COLORS[appointment.status] || "#6b7280",
                        },
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>
                        {STATUS_LABELS[appointment.status] ||
                          appointment.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="medkit-outline"
                        size={16}
                        color="#6b7280"
                      />
                      <Text style={styles.detailText}>
                        {appointment.professional_name || "Profissional"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color="#6b7280" />
                      <Text style={styles.detailText}>
                        {formatTime(appointment.start_time)} -{" "}
                        {formatTime(appointment.end_time)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.appointmentFooter}>
                    <Text style={styles.appointmentId}>
                      ID: #{appointment.id}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9ca3af"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
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
  headerContent: {
    alignItems: "center",
  },
  patientIconContainer: {
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
    marginTop: -20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4f46e5",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#4f46e5",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentDateContainer: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  appointmentDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
  },
  appointmentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  appointmentId: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
  },
});
