import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useProfessionalProfileByUserId } from "@/hooks/useProfessionals";
import { isProfileIncomplete } from "@/utils/professional";
import { router, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import GeneralInfoCard from "@/components/ui/GeneralInfoCard";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Progress } from "@/components/ui/Progress";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "react-native-ui-lib";
import { RecentPatientsCard } from "@/components/RecentPatientsCard";
import { LinearGradient } from "expo-linear-gradient";
import { ProfessionalStackParamList } from "@/navigation/ProfessionalStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { styles } from "./Home.styles";
import {
  getDashboardStats,
  getMonthlyConsultations,
  getRecentPatients,
  DashboardStats,
  MonthlyConsultation,
  PatientSummary,
} from "@/api/dashboard";

type NavigationProp = NativeStackNavigationProp<
  ProfessionalStackParamList,
  "Home"
>;

const ProfessionalHomeScreen = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfessionalProfileByUserId(
    Number(user?.id) ?? 0
  );
  console.log(user);
  const navigation = useNavigation<NavigationProp>();

  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [monthlyConsultations, setMonthlyConsultations] = useState<
    MonthlyConsultation[]
  >([]);
  const [recentPatients, setRecentPatients] = useState<PatientSummary[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxConsultas =
    monthlyConsultations.length > 0
      ? Math.max(...monthlyConsultations.map((m) => m.consultas))
      : 1;

  const handleViewAllPatients = () => {
    navigation.navigate("AllPatients");
  };

  // Fetch dashboard data function
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoadingData(true);
      setError(null);

      const [stats, consultations, patients] = await Promise.all([
        getDashboardStats(),
        getMonthlyConsultations(),
        getRecentPatients(10),
      ]);

      setDashboardStats(stats);
      setMonthlyConsultations(consultations);
      setRecentPatients(patients);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Erro ao carregar dados do dashboard");
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchDashboardData();
      }
    }, [user, fetchDashboardData])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [fetchDashboardData]);

  useEffect(() => {
    if (!loading && profile && isProfileIncomplete(profile)) {
      const timer = setTimeout(() => {
        if ((router as any).isReady) {
          router.replace("/professional/edit-profile");
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile, loading]);

  if (loadingData || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 16, color: "#6b7280" }}>
          Carregando dashboard...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={{ marginTop: 16, color: "#ef4444", textAlign: "center" }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#4f46e5"]}
          tintColor="#4f46e5"
        />
      }
    >
      <View style={{ padding: 16 }}>
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={["#4f46e5", "#7c3aed", "#a855f7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <Text style={styles.headerSubtitle}>
                  Visão geral dos seus pacientes e consultas
                </Text>
              </View>
              <View style={styles.headerIconContainer}>
                <MaterialIcons
                  name="dashboard"
                  size={32}
                  color="rgba(255,255,255,0.9)"
                />
              </View>
            </View>

            <View style={styles.dateCard}>
              <View style={styles.dateIconWrapper}>
                <Ionicons name="calendar" size={18} color="#4f46e5" />
              </View>
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Hoje</Text>
                <Text style={styles.dateValue}>
                  {new Date().toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards - Faturamento e Agendamentos */}
        <View style={styles.statsContainer}>
          {/* Faturamento Hoje - Destacado */}
          <LinearGradient
            colors={["#10b981", "#0d9488"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Faturamento Hoje</Text>
              <View style={styles.iconContainer}>
                <MaterialIcons name="attach-money" size={20} color="#fff" />
              </View>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                R${" "}
                {dashboardStats?.todayRevenue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <View style={styles.statFooter}>
                <Text style={styles.statFooterText}>
                  {dashboardStats?.todayAppointmentsCompleted || 0} consultas
                  realizadas
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Agendamentos Hoje - Destacado */}
          <LinearGradient
            colors={["#3b82f6", "#4f46e5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Agendamentos Hoje</Text>
              <View style={styles.iconContainer}>
                <MaterialIcons name="event-available" size={20} color="#fff" />
              </View>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {dashboardStats?.todayAppointments || 0}
              </Text>
              <Text style={styles.statFooterText}>
                {dashboardStats?.todayAppointmentsCompleted || 0} realizados •{" "}
                {dashboardStats?.todayAppointmentsPending || 0} pendentes
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ marginBottom: 36 }}>
          <GeneralInfoCard
            title="Consultas do Mês"
            body={
              <>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    marginBottom: 4,
                    color: Colors.blue20,
                  }}
                >
                  {dashboardStats?.monthlyConsultations || 0}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Ionicons
                    name={
                      dashboardStats?.monthlyConsultationsGrowth &&
                      dashboardStats.monthlyConsultationsGrowth >= 0
                        ? "arrow-up"
                        : "arrow-down"
                    }
                    size={12}
                    color={
                      dashboardStats?.monthlyConsultationsGrowth &&
                      dashboardStats.monthlyConsultationsGrowth >= 0
                        ? "#16a34a"
                        : "#ef4444"
                    }
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color:
                        dashboardStats?.monthlyConsultationsGrowth &&
                        dashboardStats.monthlyConsultationsGrowth >= 0
                          ? "#16a34a"
                          : "#ef4444",
                      marginRight: 4,
                    }}
                  >
                    {(dashboardStats?.monthlyConsultationsGrowth ?? 0) > 0
                      ? "+"
                      : ""}
                    {dashboardStats?.monthlyConsultationsGrowth ?? 0}%
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    em relação ao mês anterior
                  </Text>
                </View>
              </>
            }
            icon={
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#f3e8ff",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="calendar-outline" size={18} color="#7e22ce" />
              </View>
            }
          />

          <GeneralInfoCard
            title="Novos Pacientes"
            body={
              <>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    marginBottom: 4,
                    color: Colors.blue20,
                  }}
                >
                  {dashboardStats?.newPatientsThisMonth || 0}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Ionicons
                    name={
                      dashboardStats?.newPatientsGrowth &&
                      dashboardStats.newPatientsGrowth >= 0
                        ? "arrow-up"
                        : "arrow-down"
                    }
                    size={12}
                    color={
                      dashboardStats?.newPatientsGrowth &&
                      dashboardStats.newPatientsGrowth >= 0
                        ? "#16a34a"
                        : "#ef4444"
                    }
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color:
                        dashboardStats?.newPatientsGrowth &&
                        dashboardStats.newPatientsGrowth >= 0
                          ? "#16a34a"
                          : "#ef4444",
                      marginRight: 4,
                    }}
                  >
                    {(dashboardStats?.newPatientsGrowth ?? 0) > 0 ? "+" : ""}
                    {dashboardStats?.newPatientsGrowth ?? 0}%
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    em relação ao mês anterior
                  </Text>
                </View>
              </>
            }
            icon={
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#fffbeb",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="trending-up" size={18} color="#b45309" />
              </View>
            }
          />

          <GeneralInfoCard
            title="Taxa de Satisfação"
            body={
              <>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    marginBottom: 4,
                    color: Colors.blue20,
                  }}
                >
                  {dashboardStats?.satisfactionRate || 0}%
                </Text>
                <Progress value={dashboardStats?.satisfactionRate || 0} />
              </>
            }
            icon={
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#ffe4e6",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="pulse" size={18} color="#e11d48" />
              </View>
            }
          />
        </View>

        {/* Charts Section - Consultas Mensais */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <LinearGradient
                colors={["#3b82f6", "#4f46e5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chartIconContainer}
              >
                <MaterialIcons name="bar-chart" size={16} color="#fff" />
              </LinearGradient>
              <Text style={styles.chartTitle}>Consultas Mensais</Text>
            </View>
            <Text style={styles.chartDescription}>
              Evolução das consultas e novos pacientes
            </Text>
          </View>

          <View style={styles.chartContent}>
            {monthlyConsultations.map((month) => (
              <View key={month.month} style={styles.monthContainer}>
                <View style={styles.monthHeader}>
                  <Text style={styles.monthName}>{month.month}</Text>
                  <View style={styles.monthStats}>
                    <Text style={styles.consultasText}>
                      {month.consultas} consultas
                    </Text>
                    <Text style={styles.novasText}>{month.novas} novos</Text>
                  </View>
                </View>

                <View style={styles.progressBarsContainer}>
                  {/* Consultas Progress Bar */}
                  <View style={styles.progressBarWrapper}>
                    <View style={styles.consultasProgressBg}>
                      <LinearGradient
                        colors={["#3b82f6", "#4f46e5"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.progressBar,
                          {
                            width: `${(month.consultas / maxConsultas) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Novos Pacientes Progress Bar */}
                  <View style={styles.progressBarWrapper}>
                    <View style={styles.novasProgressBg}>
                      <LinearGradient
                        colors={["#10b981", "#0d9488"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.progressBar,
                          { width: `${(month.novas / 25) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={{ marginBottom: 50 }}>
          <RecentPatientsCard
            recentPatients={recentPatients}
            onViewAll={handleViewAllPatients}
            onPatientPress={(patientId, patientName) => {
              navigation.navigate("PatientHistory", {
                patientId: Number(patientId),
                patientName,
              });
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfessionalHomeScreen;
