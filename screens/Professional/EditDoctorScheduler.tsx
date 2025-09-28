import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "react-native-ui-lib";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { timeOptions } from "@/utils/constants";
import { MaterialIcons } from "@expo/vector-icons";
interface WorkSchedule {
  [key: string]: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

const daysOfWeek = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

export default function EditDoctorScheduler() {
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
    monday: { enabled: true, startTime: "08:00", endTime: "17:00" },
    tuesday: { enabled: true, startTime: "08:00", endTime: "17:00" },
    wednesday: { enabled: true, startTime: "08:00", endTime: "17:00" },
    thursday: { enabled: true, startTime: "08:00", endTime: "17:00" },
    friday: { enabled: true, startTime: "08:00", endTime: "17:00" },
    saturday: { enabled: false, startTime: "08:00", endTime: "12:00" },
    sunday: { enabled: false, startTime: "08:00", endTime: "12:00" },
  });

  const [serviceSettings, setServiceSettings] = useState({
    services: "",
    price: "",
    only_online: false,
    only_presential: false,
    modality: "online",
  });

  const handleDayToggle = (day: string, enabled: boolean) => {
    setWorkSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled },
    }));
  };

  const handleTimeChange = (
    day: string,
    type: "startTime" | "endTime",
    value: string
  ) => {
    setWorkSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: value },
    }));
  };

  const getWorkingDaysCount = () => {
    return Object.values(workSchedule).filter((day) => day.enabled).length;
  };

  const getTotalWeeklyHours = () => {
    return Object.values(workSchedule).reduce((total, day) => {
      if (!day.enabled) return total;
      const start =
        parseInt(day.startTime.split(":")[0], 10) +
        parseInt(day.startTime.split(":")[1], 10) / 60;
      const end =
        parseInt(day.endTime.split(":")[0], 10) +
        parseInt(day.endTime.split(":")[1], 10) / 60;
      return total + (end - start);
    }, 0);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summary}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Feather name="calendar" size={24} color="black" />
          <Text style={{ marginLeft: 8, fontWeight: "bold", fontSize: 16 }}>
            Resumo da Agenda
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Dias de trabalho:</Text>
          <Text style={styles.summaryValue}>
            {getWorkingDaysCount()} dias/semana
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Horas semanais:</Text>
          <Text style={styles.summaryValue}>{getTotalWeeklyHours()}h</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Modalidade:</Text>
          <Text style={styles.summaryValue}>
            {serviceSettings.only_online
              ? "Online"
              : serviceSettings.only_presential
              ? "Presencial"
              : "Híbrida"}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Preço da consulta:</Text>
          <Text style={styles.summaryValue}>
            R$ {serviceSettings.price || "0,00"}
          </Text>
        </View>
      </View>
      {/* Serviços e Preços */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💲 Serviços e Preços</Text>
        <Text style={styles.cardDescription}>
          Configure seus serviços e valores
        </Text>

        <Text style={styles.label}>Serviços Oferecidos</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          placeholder="Consulta Cardiológica, Eletrocardiograma, Holter 24h"
          value={serviceSettings.services}
          onChangeText={(text) =>
            setServiceSettings((prev) => ({ ...prev, services: text }))
          }
        />
        <Text style={styles.helperText}>Separe os serviços por vírgula</Text>

        <Text style={styles.label}>Preço da Consulta (R$)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="100"
          value={serviceSettings.price}
          onChangeText={(text) =>
            setServiceSettings((prev) => ({ ...prev, price: text }))
          }
        />
      </View>

      {/* Modalidade de Atendimento */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Modalidade de Atendimento</Text>
        <Text style={styles.cardDescription}>
          Configure como você atende seus pacientes
        </Text>

        <View style={[styles.row, { marginTop: 8 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MaterialIcons name="computer" size={24} color="black" />
            <Text style={styles.label}>Online</Text>
          </View>
          <Switch
            value={serviceSettings.only_online}
            onValueChange={(val) =>
              setServiceSettings((prev) => ({
                ...prev,
                only_online: val,
                only_presential: val ? false : prev.only_presential, // desativa presencial se online ativado
              }))
            }
          />
        </View>

        <View style={[styles.row, { marginTop: 8 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Entypo name="location-pin" size={24} color="black" />
            <Text style={styles.label}>Presencial</Text>
          </View>
          <Switch
            value={serviceSettings.only_presential}
            onValueChange={(val) =>
              setServiceSettings((prev) => ({
                ...prev,
                only_presential: val,
                only_online: val ? false : prev.only_online, // desativa online se presencial ativado
              }))
            }
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <MaterialCommunityIcons name="timer-outline" size={24} color="black" />
        <Text style={styles.title}>Horários de Atendimento</Text>
      </View>

      {daysOfWeek.map((day) => (
        <View key={day.key} style={styles.dayContainer}>
          <View style={styles.row}>
            <Text style={styles.dayLabel}>{day.label}</Text>
            <Switch
              value={workSchedule[day.key].enabled}
              onValueChange={(val) => handleDayToggle(day.key, val)}
            />
          </View>

          {workSchedule[day.key].enabled && (
            <View style={styles.timeRow}>
              <Picker
                selectedValue={workSchedule[day.key].startTime}
                style={styles.picker}
                onValueChange={(val) =>
                  handleTimeChange(day.key, "startTime", val)
                }
              >
                {timeOptions.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>

              <Picker
                selectedValue={workSchedule[day.key].endTime}
                style={styles.picker}
                onValueChange={(val) =>
                  handleTimeChange(day.key, "endTime", val)
                }
              >
                {timeOptions.map((time) => (
                  <Picker.Item key={time} label={time} value={time} />
                ))}
              </Picker>
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => alert("Configurações salvas!")}
      >
        <Text style={styles.saveText}>Salvar Configurações</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  title: { fontSize: 24, fontWeight: "bold" },

  // Card genérico para serviços, horários e resumo
  card: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 1,
    elevation: 2,
  },

  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  cardDescription: { fontSize: 14, color: "#666", marginBottom: 8 },

  label: { fontSize: 16, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  textarea: { height: 80, textAlignVertical: "top" },
  helperText: { fontSize: 12, color: "#666", marginBottom: 8 },

  dayContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    width: "100%",
    borderColor: Colors.white,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 1,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dayLabel: { fontSize: 16, flex: 1 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  picker: { flex: 1, height: 60, backgroundColor: "#f0f0f0", borderRadius: 6 },

  summary: {
    marginTop: 24,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: Colors.white,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 1,
    elevation: 2,
  },

  saveButton: {
    marginTop: 24,
    marginBottom: 32,
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: { color: "#666", fontSize: 14 },
  summaryValue: { fontWeight: "500", fontSize: 14 },
});
