import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MaterialIcons } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { timeOptions } from "@/utils/constants";
import { styles } from "./EditDoctorScheduler.styles";
import api from "@/api/api";
import { useAuth } from "@/hooks/useAuth";
import { getMyProfessionalProfile } from "@/api/professional";
import navigation from "@/navigation";
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
  const { user } = useAuth();
  const navigation = useNavigation();
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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch professional profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const profile = await getMyProfessionalProfile();

        // Populate service settings
        setServiceSettings({
          services: profile.services.join(", ") || "",
          price: profile.price ? profile.price.toString() : "",
          only_online: profile.onlyOnline || false,
          only_presential: profile.onlyPresential || false,
          modality: profile.onlyOnline
            ? "online"
            : profile.onlyPresential
            ? "presential"
            : "hybrid",
        });

        // Populate work schedule from available days
        if (
          profile.availableDaysOfWeek &&
          profile.availableDaysOfWeek.length > 0
        ) {
          const newSchedule: WorkSchedule = {
            monday: { enabled: false, startTime: "08:00", endTime: "17:00" },
            tuesday: { enabled: false, startTime: "08:00", endTime: "17:00" },
            wednesday: { enabled: false, startTime: "08:00", endTime: "17:00" },
            thursday: { enabled: false, startTime: "08:00", endTime: "17:00" },
            friday: { enabled: false, startTime: "08:00", endTime: "17:00" },
            saturday: { enabled: false, startTime: "08:00", endTime: "12:00" },
            sunday: { enabled: false, startTime: "08:00", endTime: "12:00" },
          };

          // Enable the days from the profile
          profile.availableDaysOfWeek.forEach((day) => {
            if (newSchedule[day]) {
              newSchedule[day] = {
                enabled: true,
                startTime: profile.startHour || "08:00",
                endTime: profile.endHour || "17:00",
              };
            }
          });

          setWorkSchedule(newSchedule);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados do perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

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

  const transformScheduleForBackend = () => {
    // Get enabled days
    const enabledDays = Object.entries(workSchedule)
      .filter(([_, day]) => day.enabled)
      .map(([key, _]) => key);

    // Get the most common start and end times from enabled days
    const enabledSchedules = Object.entries(workSchedule)
      .filter(([_, day]) => day.enabled)
      .map(([_, day]) => ({ startTime: day.startTime, endTime: day.endTime }));

    // Use the first enabled day's times, or default times if none enabled
    const startHour =
      enabledSchedules.length > 0 ? enabledSchedules[0].startTime : "08:00";
    const endHour =
      enabledSchedules.length > 0 ? enabledSchedules[0].endTime : "17:00";

    return {
      available_days_of_week: enabledDays.join(","),
      start_hour: startHour,
      end_hour: endHour,
    };
  };

  const handleSaveConfiguration = async () => {
    try {
      setIsSaving(true);

      // Validate required fields
      if (!serviceSettings.services || serviceSettings.services.trim() === "") {
        Alert.alert("Erro", "Por favor, informe os serviços oferecidos.");
        return;
      }

      if (!serviceSettings.price || serviceSettings.price.trim() === "") {
        Alert.alert("Erro", "Por favor, informe o preço da consulta.");
        return;
      }

      // Check if at least one day is enabled
      const hasEnabledDays = Object.values(workSchedule).some(
        (day) => day.enabled
      );
      if (!hasEnabledDays) {
        Alert.alert(
          "Erro",
          "Por favor, selecione pelo menos um dia de atendimento."
        );
        return;
      }

      // Transform schedule data
      const scheduleData = transformScheduleForBackend();

      // Parse price (remove any non-numeric characters except comma and dot)
      const priceValue = parseFloat(
        serviceSettings.price.replace(",", ".").replace(/[^0-9.]/g, "")
      );

      if (isNaN(priceValue) || priceValue < 0) {
        Alert.alert("Erro", "Por favor, informe um preço válido.");
        return;
      }

      // Prepare data for API
      const updateData = {
        services: serviceSettings.services,
        price: priceValue,
        only_online: serviceSettings.only_online,
        only_presential: serviceSettings.only_presential,
        available_days_of_week: scheduleData.available_days_of_week,
        start_hour: scheduleData.start_hour,
        end_hour: scheduleData.end_hour,
      };

      // Send to backend
      const response = await api.put("/professionals/me", updateData);

      Alert.alert("Sucesso!", "Suas configurações foram salvas com sucesso.", [
        {
          text: "OK",
          style: "default",
        },
      ]);
      navigation.goBack();
    } catch (error: any) {
      console.error("Error saving configuration:", error);

      let errorMessage =
        "Não foi possível salvar as configurações. Tente novamente.";

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 16, color: "#6b7280" }}>
          Carregando configurações...
        </Text>
      </View>
    );
  }

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
            isSaving && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveConfiguration}
          disabled={isSaving}
        >
          <View style={styles.saveButtonContent}>
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
            )}
            <Text style={styles.saveText}>
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
