import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { RecentPatientsCard } from "@/components/RecentPatientsCard";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { getAllPatients, PatientSummary } from "@/api/dashboard";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProfessionalStackParamList } from "@/navigation/ProfessionalStack";


type SortOrder = "asc" | "desc" | "none";

const AllPatientsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfessionalStackParamList>>();
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [allPatients, setAllPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all patients function
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const patients = await getAllPatients();
      setAllPatients(patients);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Refetch patients when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPatients();
    }, [fetchPatients])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  }, [fetchPatients]);

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = allPatients;

    // Filter by name
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = allPatients.filter(
        (patient) =>
          patient.nome.toLowerCase().includes(search)
      );
    }

    // Sort by last consultation date
    if (sortOrder !== "none") {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.ultimaConsulta).getTime();
        const dateB = new Date(b.ultimaConsulta).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    return filtered;
  }, [searchText, sortOrder, allPatients]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => {
      if (prev === "none") return "desc";
      if (prev === "desc") return "asc";
      return "none";
    });
  };

  const getSortIcon = () => {
    if (sortOrder === "asc") return "arrow-up";
    if (sortOrder === "desc") return "arrow-down";
    return "swap-vertical";
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 16, color: '#6b7280' }}>Carregando pacientes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 16 }]}>
        <MaterialIcons name="error-outline" size={48} color="#ef4444" />
        <Text style={{ marginTop: 16, color: '#ef4444', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ marginBottom: 15 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4f46e5"]}
              tintColor="#4f46e5"
            />
          }
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Todos os Pacientes</Text>
              <Text style={styles.subtitle}>
                {filteredAndSortedPatients.length} paciente(s) encontrado(s)
              </Text>
            </View>

            {/* Filters Section */}
            <View style={styles.filtersContainer}>
              {/* Search Input */}
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#6b7280"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por nome..."
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholderTextColor="#9ca3af"
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText("")}>
                    <Ionicons name="close-circle" size={20} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Sort Button */}
              <TouchableOpacity
                style={styles.sortButton}
                onPress={toggleSortOrder}
              >
                <MaterialIcons name="event" size={18} color="#3b82f6" />
                <Text style={styles.sortButtonText}>Data</Text>
                <Ionicons
                  name={getSortIcon()}
                  size={18}
                  color={sortOrder !== "none" ? "#3b82f6" : "#6b7280"}
                />
              </TouchableOpacity>
            </View>

            <RecentPatientsCard 
              recentPatients={filteredAndSortedPatients}
              onPatientPress={(patientId, patientName) => {
                navigation.navigate("PatientHistory", {
                  patientId: Number(patientId),
                  patientName,
                });
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 6,
  },
  sortButtonText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
});

export default AllPatientsScreen;
