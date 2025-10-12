import { useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useProfessionalProfileByUserId } from "@/hooks/useProfessionals";
import { isProfileIncomplete } from "@/utils/professional";
import { router, useNavigation } from "expo-router";
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

const monthlyConsultations = [
  { month: "Janeiro", consultas: 45, novas: 12 },
  { month: "Fevereiro", consultas: 52, novas: 15 },
  { month: "Março", consultas: 48, novas: 10 },
  { month: "Abril", consultas: 60, novas: 18 },
  { month: "Maio", consultas: 30, novas: 5 },
];

const maxConsultas = Math.max(...monthlyConsultations.map((m) => m.consultas));

const recentPatients = [
  {
    id: 1,
    avatar: "A",
    nome: "Ana Silva",
    idade: 28,
    ultimaConsulta: "2025-09-20T10:30:00Z",
    proximaConsulta: "2025-10-05T14:00:00Z",
    status: "Ativo" as const,
    prioridade: "Alta" as const,
  },
  {
    id: 2,
    avatar: "B",
    nome: "Bruno Santos",
    idade: 35,
    ultimaConsulta: "2025-09-18T09:00:00Z",
    proximaConsulta: "2025-10-10T16:30:00Z",
    status: "Ativo" as const,
    prioridade: "Média" as const,
  },
  {
    id: 3,
    avatar: "C",
    nome: "Carla Mendes",
    idade: 42,
    ultimaConsulta: "2025-09-22T11:15:00Z",
    proximaConsulta: "2025-10-12T13:00:00Z",
    status: "Pendente" as const,
    prioridade: "Baixa" as const,
  },
  {
    id: 4,
    avatar: "D",
    nome: "Daniel Oliveira",
    idade: 50,
    ultimaConsulta: "2025-09-15T08:45:00Z",
    proximaConsulta: "2025-10-08T10:30:00Z",
    status: "Ativo" as const,
    prioridade: "Alta" as const,
  },
  {
    id: 5,
    avatar: "E",
    nome: "Eduarda Costa",
    idade: 31,
    ultimaConsulta: "2025-09-21T14:00:00Z",
    proximaConsulta: "2025-10-06T15:00:00Z",
    status: "Ativo" as const,
    prioridade: "Média" as const,
  },
  {
    id: 6,
    avatar: "F",
    nome: "Felipe Rocha",
    idade: 27,
    ultimaConsulta: "2025-09-19T13:30:00Z",
    proximaConsulta: "2025-10-11T09:00:00Z",
    status: "Inativo" as const,
    prioridade: "Baixa" as const,
  },
  {
    id: 7,
    avatar: "G",
    nome: "Gabriela Oliveira",
    idade: 29,
    ultimaConsulta: "2025-09-25T12:00:00Z",
    proximaConsulta: "2025-10-15T11:45:00Z",
    status: "Ativo" as const,
    prioridade: "Alta" as const,
  },

  {
    id: 9,
    avatar: "I",
    nome: "Isabelia Costa",
    idade: 25,
    ultimaConsulta: "2025-09-22T11:30:00Z",
    proximaConsulta: "2025-10-22T14:00:00Z",
    status: "Ativo" as const,
    prioridade: "Alta" as const,
  },
  {
    id: 10,
    avatar: "J",
    nome: "Juliana Costa",
    idade: 28,
    ultimaConsulta: "2025-09-20T10:30:00Z",
    proximaConsulta: "2025-10-05T14:00:00Z",
    status: "Ativo" as const,
    prioridade: "Alta" as const,
  },
];

type NavigationProp = NativeStackNavigationProp<
  ProfessionalStackParamList,
  "Home"
>;

const ProfessionalHomeScreen = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfessionalProfileByUserId(
    Number(user?.id) ?? 0
  );
  const navigation = useNavigation<NavigationProp>();

  const handleViewAllPatients = () => {
    navigation.navigate("AllPatients");
  };

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

  return (
    <ScrollView>
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
              <Text style={styles.statValue}>R$ 3.450,00</Text>
              <View style={styles.statFooter}>
                <Ionicons
                  name="arrow-up"
                  size={12}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={styles.statFooterText}>+15% vs ontem</Text>
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
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statFooterText}>
                8 realizados • 4 pendentes
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
                  58
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Ionicons
                    name="arrow-up"
                    size={12}
                    color="#16a34a"
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#16a34a",
                      marginRight: 4,
                    }}
                  >
                    +5%
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
                  21
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 2,
                  }}
                >
                  <Ionicons
                    name="arrow-up"
                    size={12}
                    color="#16a34a"
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#16a34a",
                      marginRight: 4,
                    }}
                  >
                    +8%
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
                  98%
                </Text>
                <Progress value={98} />
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
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfessionalHomeScreen;
