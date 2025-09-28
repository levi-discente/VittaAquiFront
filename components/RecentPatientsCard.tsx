import React from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import { Colors } from "react-native-ui-lib";
type Patient = {
  id: string | number;
  avatar?: string;
  nome: string;
  idade: number;
  ultimaConsulta: string;
  proximaConsulta: string;
};

type Props = {
  recentPatients: Patient[];
};

export const RecentPatientsCard: React.FC<Props> = ({ recentPatients }) => {
  const tableHead = [
    "Paciente",
    "Idade",
    "Última Consulta",
    "Próxima Consulta",
  ];

  const tableData = recentPatients.map((patient) => [
    patient.nome,
    `${patient.idade} anos`,
    new Date(patient.ultimaConsulta).toLocaleDateString("pt-BR"),
    new Date(patient.proximaConsulta).toLocaleDateString("pt-BR"),
  ]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator>
        <Table borderStyle={{ borderWidth: 1, borderColor: "#c8e1ff" }}>
          <Row
            data={tableHead}
            style={styles.head}
            textStyle={styles.text}
            widthArr={[120, 80, 120, 140]}
          />
          {tableData.map((rowData, index) => (
            <Row
              key={index}
              data={rowData}
              style={[
                styles.row,
                index % 2 === 1 ? { backgroundColor: "#f7f7f7" } : undefined,
              ]}
              textStyle={styles.text}
              widthArr={[120, 80, 120, 140]}
            />
          ))}
        </Table>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  description: { fontSize: 14, color: "#555", marginBottom: 12 },
  head: { height: 40, backgroundColor: Colors.grey60 },
  text: { margin: 6, fontSize: 14 },
  row: { height: 40, backgroundColor: Colors.blue80 },
});
