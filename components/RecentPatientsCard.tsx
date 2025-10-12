import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { Table, Row } from "react-native-table-component";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";

type Patient = {
  id: string | number;
  avatar?: string;
  nome: string;
  idade: number;
  ultimaConsulta: string;
  proximaConsulta: string;
  status?: "Ativo" | "Inativo" | "Pendente";
  prioridade?: "Alta" | "Média" | "Baixa";
};

type Props = {
  recentPatients: Patient[];
  onViewAll?: () => void;
};

export const RecentPatientsCard: React.FC<Props> = ({
  recentPatients,
  onViewAll,
}) => {
  const tableHead = [
    "Paciente",
    "Idade",
    "Última Consulta",
    "Próxima Consulta",
    "Ações",
  ];

  const columnWidths = [150, 80, 120, 120, 100];

  const renderCustomRow = (patient: Patient, index: number) => {
    return (
      <View
        key={patient.id}
        style={[styles.customRow, index % 2 === 1 && styles.customRowAlt]}
      >
        {/* Paciente com Avatar */}
        <View style={[styles.cell, { width: columnWidths[0] }]}>
          <View style={styles.patientCell}>
            <LinearGradient
              colors={["#3b82f6", "#4f46e5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{patient.avatar}</Text>
            </LinearGradient>
            <Text style={styles.patientName}>{patient.nome}</Text>
          </View>
        </View>

        {/* Idade */}
        <View style={[styles.cell, { width: columnWidths[1] }]}>
          <Text style={styles.cellText}>{patient.idade} anos</Text>
        </View>

        {/* Última Consulta */}
        <View style={[styles.cell, { width: columnWidths[2] }]}>
          <Text style={styles.cellText}>
            {new Date(patient.ultimaConsulta).toLocaleDateString("pt-BR")}
          </Text>
        </View>

        {/* Próxima Consulta */}
        <View style={[styles.cell, { width: columnWidths[3] }]}>
          <Text style={styles.cellText}>
            {new Date(patient.proximaConsulta).toLocaleDateString("pt-BR")}
          </Text>
        </View>

        {/* Ações */}
        <View style={[styles.cell, { width: columnWidths[4] }]}>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name="document-text-outline"
                size={16}
                color="#3b82f6"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <LinearGradient
              colors={["#f59e0b", "#ea580c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconContainer}
            >
              <MaterialIcons name="people" size={16} color="#fff" />
            </LinearGradient>
            <Text style={styles.headerTitle}>Pacientes Recentes</Text>
          </View>
          <Text style={styles.headerDescription}>
            Lista dos pacientes com consultas mais recentes
          </Text>
        </View>
        {onViewAll && (
          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
            <Text style={styles.viewAllText}>Ver todos</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <Table borderStyle={{ borderWidth: 0 }}>
            <Row
              data={tableHead}
              style={styles.tableHead}
              textStyle={styles.headText}
              widthArr={columnWidths}
            />
          </Table>
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator>
            {recentPatients.map((patient, index) =>
              renderCustomRow(patient, index)
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  viewAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  viewAllText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  tableHead: {
    height: 44,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "left",
    paddingLeft: 12,
  },
  customRow: {
    flexDirection: "row",
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  customRowAlt: {
    backgroundColor: "#f9fafb",
  },
  cell: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
  },
  patientCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#dbeafe",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  patientName: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  cellText: {
    fontSize: 14,
    color: "#374151",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
