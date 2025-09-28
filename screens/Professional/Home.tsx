import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useProfessionalProfileByUserId } from "@/hooks/useProfessionals";
import { isProfileIncomplete } from "@/utils/professional";
import { router } from "expo-router";
import GeneralInfoCard from "@/components/ui/GeneralInfoCard";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Progress } from "@/components/ui/Progress";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors } from "react-native-ui-lib";
import { RecentPatientsCard } from "@/components/RecentPatientsCard";

const recentPatients = [
  {
    id: 1,
    avatar: "A",
    nome: "Ana Silva",
    idade: 28,
    ultimaConsulta: "2025-09-20T10:30:00Z",
    proximaConsulta: "2025-10-05T14:00:00Z",
  },
  {
    id: 2,
    avatar: "B",
    nome: "Bruno Santos",
    idade: 35,
    ultimaConsulta: "2025-09-18T09:00:00Z",
    proximaConsulta: "2025-10-10T16:30:00Z",
  },
  {
    id: 3,
    avatar: "C",
    nome: "Carla Mendes",
    idade: 42,
    ultimaConsulta: "2025-09-22T11:15:00Z",
    proximaConsulta: "2025-10-12T13:00:00Z",
  },
  {
    id: 4,
    avatar: "D",
    nome: "Daniel Oliveira",
    idade: 50,
    ultimaConsulta: "2025-09-15T08:45:00Z",
    proximaConsulta: "2025-10-08T10:30:00Z",
  },
  {
    id: 5,
    avatar: "E",
    nome: "Eduarda Costa",
    idade: 31,
    ultimaConsulta: "2025-09-21T14:00:00Z",
    proximaConsulta: "2025-10-06T15:00:00Z",
  },
  {
    id: 6,
    avatar: "F",
    nome: "Felipe Rocha",
    idade: 27,
    ultimaConsulta: "2025-09-19T13:30:00Z",
    proximaConsulta: "2025-10-11T09:00:00Z",
  },
];

const ProfessionalHomeScreen = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfessionalProfileByUserId(
    Number(user?.id) ?? 0
  );

  useEffect(() => {
    if (!loading && profile && isProfileIncomplete(profile)) {
      const timer = setTimeout(() => {
        if ((router as any).isReady) {
          router.replace("/professional/edit-profile");
        }
      }, 0); // Adiciona ao final da queue de renderização
      return () => clearTimeout(timer);
    }
  }, [profile, loading]);

  return (
    <View style={{ backgroundColor: "#F9FAFB" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ marginBottom: 80 }}
        >
          <View style={{ padding: 16 }}>
            <View style={{ gap: 12, marginBottom: 24 }}>
              <Text style={styles.title}>Dashboard</Text>
              <Text>Visão geral dos seus pacientes e consultas.</Text>
            </View>
            <View style={{ marginBottom: 36 }}>
              <GeneralInfoCard
                title="Total de Pacientes"
                body="1,247"
                icon={
                  <MaterialIcons
                    name="people"
                    size={24}
                    color={Colors.blue30}
                  />
                }
              />
              <GeneralInfoCard
                title="Consultas Hoje"
                body="32"
                icon={
                  <MaterialIcons name="event" size={24} color={Colors.blue30} />
                }
              />
              <GeneralInfoCard
                title="Consultas Este Mês"
                body="512"
                icon={
                  <MaterialIcons name="event" size={24} color={Colors.blue30} />
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
                      85%
                    </Text>
                    <Progress value={85} />
                  </>
                }
                icon={<Ionicons name="pulse" size={24} color={Colors.blue30} />}
              />
            </View>
            <View style={{ marginBottom: 50 }}>
              <Text style={styles.title}>Pacientes Recentes</Text>
              <View style={{ backgroundColor: Colors.white }}>
                <RecentPatientsCard recentPatients={recentPatients} />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
  },
});

export default ProfessionalHomeScreen;
