import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MaterialIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { timeOptions } from "@/utils/constants";
import { styles } from "./EditDoctorScheduler.styles";
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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Agenda e Atendimento</Text>
          <Text style={styles.headerSubtitle}>
            Configure seus horários e modalidades de atendimento
          </Text>
        </View>

        <View style={styles.content}>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="stats-chart" size={20} color="#7c3aed" />
              </View>
              <Text style={styles.summaryTitle}>Resumo da Agenda</Text>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Dias de trabalho</Text>
                <View style={styles.statsBadge}>
                  <Ionicons name="calendar" size={14} color="#16a34a" />
                  <Text style={styles.statsBadgeText}>
                    {getWorkingDaysCount()} dias/semana
                  </Text>
                </View>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Horas semanais</Text>
                <View style={styles.statsBadge}>
                  <Ionicons name="time" size={14} color="#16a34a" />
                  <Text style={styles.statsBadgeText}>
                    {getTotalWeeklyHours()}h
                  </Text>
                </View>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Modalidade</Text>
                <View style={styles.summaryBadge}>
                  <Text style={styles.summaryBadgeText}>
                    {serviceSettings.only_online
                      ? "Online"
                      : serviceSettings.only_presential
                      ? "Presencial"
                      : "Híbrida"}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Preço da consulta</Text>
                <Text style={styles.summaryValue}>
                  R$ {serviceSettings.price || "0,00"}
                </Text>
              </View>
            </View>
          </View>

          {/* Services and Pricing */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>💰 Serviços e Preços</Text>
              <Text style={styles.cardDescription}>
                Configure seus serviços e valores de consulta
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Serviços Oferecidos</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                multiline
                placeholder="Ex: Consulta Cardiológica, Eletrocardiograma..."
                placeholderTextColor="#9ca3af"
                value={serviceSettings.services}
                onChangeText={(text) =>
                  setServiceSettings((prev) => ({ ...prev, services: text }))
                }
              />
              <Text style={styles.helperText}>
                💡 Separe os serviços por vírgula
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preço da Consulta (R$)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="100,00"
                placeholderTextColor="#9ca3af"
                value={serviceSettings.price}
                onChangeText={(text) =>
                  setServiceSettings((prev) => ({ ...prev, price: text }))
                }
              />
            </View>
          </View>

          {/* Modality Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🏥 Modalidade de Atendimento</Text>
              <Text style={styles.cardDescription}>
                Escolha como você atende seus pacientes
              </Text>
            </View>

            <Pressable
              style={[
                styles.modalityRow,
                serviceSettings.only_online && styles.modalityRowActive,
              ]}
              onPress={() =>
                setServiceSettings((prev) => ({
                  ...prev,
                  only_online: !prev.only_online,
                  only_presential: prev.only_online
                    ? prev.only_presential
                    : false,
                }))
              }
            >
              <View style={styles.modalityLeft}>
                <View style={styles.modalityIconContainer}>
                  <MaterialIcons name="computer" size={22} color="#4f46e5" />
                </View>
                <Text style={styles.modalityLabel}>Atendimento Online</Text>
              </View>
              <Switch
                value={serviceSettings.only_online}
                onValueChange={(val) =>
                  setServiceSettings((prev) => ({
                    ...prev,
                    only_online: val,
                    only_presential: val ? false : prev.only_presential,
                  }))
                }
                trackColor={{ false: "#d1d5db", true: "#a78bfa" }}
                thumbColor={serviceSettings.only_online ? "#7c3aed" : "#f3f4f6"}
              />
            </Pressable>

            <Pressable
              style={[
                styles.modalityRow,
                serviceSettings.only_presential && styles.modalityRowActive,
              ]}
              onPress={() =>
                setServiceSettings((prev) => ({
                  ...prev,
                  only_presential: !prev.only_presential,
                  only_online: prev.only_presential ? prev.only_online : false,
                }))
              }
            >
              <View style={styles.modalityLeft}>
                <View style={styles.modalityIconContainer}>
                  <Entypo name="location-pin" size={22} color="#4f46e5" />
                </View>
                <Text style={styles.modalityLabel}>Atendimento Presencial</Text>
              </View>
              <Switch
                value={serviceSettings.only_presential}
                onValueChange={(val) =>
                  setServiceSettings((prev) => ({
                    ...prev,
                    only_presential: val,
                    only_online: val ? false : prev.only_online,
                  }))
                }
                trackColor={{ false: "#d1d5db", true: "#a78bfa" }}
                thumbColor={
                  serviceSettings.only_presential ? "#7c3aed" : "#f3f4f6"
                }
              />
            </Pressable>
          </View>

          {/* Schedule Section */}
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIconContainer,
                { backgroundColor: "#dbeafe" },
              ]}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#1e40af"
              />
            </View>
            <Text style={styles.sectionTitle}>Horários de Atendimento</Text>
          </View>

          {daysOfWeek.map((day) => {
            const isEnabled = workSchedule[day.key].enabled;
            return (
              <View
                key={day.key}
                style={[styles.dayCard, isEnabled && styles.dayCardActive]}
              >
                <View style={styles.dayHeader}>
                  <Text
                    style={[
                      styles.dayLabel,
                      !isEnabled && styles.dayLabelInactive,
                    ]}
                  >
                    {day.label}
                  </Text>
                  <Switch
                    value={isEnabled}
                    onValueChange={(val) => handleDayToggle(day.key, val)}
                    trackColor={{ false: "#d1d5db", true: "#a78bfa" }}
                    thumbColor={isEnabled ? "#7c3aed" : "#f3f4f6"}
                  />
                </View>

                {isEnabled && (
                  <View style={styles.timeRow}>
                    <View style={styles.timePickerContainer}>
                      <Text style={styles.timeLabel}>Início</Text>
                      <View style={styles.pickerWrapper}>
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
                      </View>
                    </View>

                    <View style={styles.timePickerContainer}>
                      <Text style={styles.timeLabel}>Término</Text>
                      <View style={styles.pickerWrapper}>
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
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Save Button - Fixed at bottom */}
      <View style={styles.saveButtonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
          onPress={() => alert("Configurações salvas com sucesso!")}
        >
          <View style={styles.saveButtonContent}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.saveText}>Salvar Configurações</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
