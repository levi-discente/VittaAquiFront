import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { RecentPatientsCard } from "@/components/RecentPatientsCard";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Mock data - you can replace this with actual API data later
const allPatients = [
  {
    id: 1,
    avatar: "A",
    nome: "Ana Silva",
    email: "ana.silva@email.com",
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
    email: "bruno.santos@email.com",
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
    email: "carla.mendes@email.com",
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
    email: "daniel.oliveira@email.com",
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
    email: "eduarda.costa@email.com",
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
    email: "felipe.rocha@email.com",
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
    email: "gabriela.oliveira@email.com",
    idade: 29,
    ultimaConsulta: "2025-09-25T12:00:00Z",
    proximaConsulta: "2025-10-15T11:45:00Z",
    status: "Ativo" as const,
    prioridade: "Alta" as const,
  },
  {
    id: 8,
    avatar: "H",
    nome: "Henrique Alves",
    email: "henrique.alves@email.com",
    idade: 45,
    ultimaConsulta: "2025-09-17T15:30:00Z",
    proximaConsulta: "2025-10-20T10:00:00Z",
    status: "Ativo" as const,
    prioridade: "Média" as const,
  },
  {
    id: 9,
    avatar: "I",
    nome: "Isabelia Costa",
    email: "isabelia.costa@email.com",
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
    email: "juliana.costa@email.com",
    idade: 28,
    ultimaConsulta: "2025-09-20T10:30:00Z",
    proximaConsulta: "2025-10-05T14:00:00Z",
    status: "Ativo" as const,
    prioridade: "Alta" as const,
  },
  {
    id: 11,
    avatar: "K",
    nome: "Karina Souza",
    email: "karina.souza@email.com",
    idade: 33,
    ultimaConsulta: "2025-09-19T09:15:00Z",
    proximaConsulta: "2025-10-18T16:30:00Z",
    status: "Pendente" as const,
    prioridade: "Média" as const,
  },
  {
    id: 12,
    avatar: "L",
    nome: "Lucas Ferreira",
    email: "lucas.ferreira@email.com",
    idade: 38,
    ultimaConsulta: "2025-09-16T14:45:00Z",
    proximaConsulta: "2025-10-25T11:00:00Z",
    status: "Ativo" as const,
    prioridade: "Baixa" as const,
  },
];

type SortOrder = "asc" | "desc" | "none";

const AllPatientsScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = allPatients;

    // Filter by name or email
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = allPatients.filter(
        (patient) =>
          patient.nome.toLowerCase().includes(search) ||
          patient.email.toLowerCase().includes(search)
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
  }, [searchText, sortOrder]);

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

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 20}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{ marginBottom: 15 }}
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
                  placeholder="Buscar por nome ou email..."
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

            <RecentPatientsCard recentPatients={filteredAndSortedPatients} />
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
