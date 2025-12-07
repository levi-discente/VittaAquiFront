import React, { useState, useMemo, useCallback } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  Alert,
  RefreshControl,
} from "react-native";
import { Text, Colors } from "react-native-ui-lib";
import { Calendar, DateData, MarkedDates } from "react-native-calendars";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "@/navigation/ProfileStack";
import { useMyAppointments } from "@/hooks/useAppointments";
import { Appointment } from "@/types/appointment";
import { AppointmentCard } from "@/components/AppointmentCard";
import { useFocusEffect } from "@react-navigation/native";
import { updateAppointment } from "@/api/appointment";
import { AppointmentModal } from "@/components/AppointmentModal";

const CALENDAR_HEIGHT = 350;
const CARD_MAX_WIDTH = 400;

import { LocaleConfig } from "react-native-calendars";

LocaleConfig.locales["pt"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ],
  dayNames: [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt";

type Props = NativeStackScreenProps<ProfileStackParamList, "Appointments">;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatLocalDateString(dateString: string) {
  const [y, m, d] = dateString.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export const AppointmentsScreen: React.FC<Props> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const PADDING = width * 0.04;
  const columns = useMemo(() => {
    const avail = width - PADDING * 2;
    return Math.max(1, Math.floor(avail / (CARD_MAX_WIDTH + PADDING)));
  }, [width]);

  const { appointments, loading, error, refresh } = useMyAppointments();
  const safeAppointments = appointments ?? [];
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const initialDate = `${today.getFullYear()}-${pad(
    today.getMonth() + 1
  )}-${pad(today.getDate())}`;
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);

  const markedDates = useMemo<MarkedDates>(() => {
    const m: MarkedDates = {};
    safeAppointments.forEach((ap) => {
      const day = ap.start_time.slice(0, 10);
      if (!m[day]) {
        m[day] = { dots: [], marked: true };
      }
      m[day].dots.push({ key: ap.id, color: Colors.blue30 });
    });
    m[selectedDate] = {
      ...(m[selectedDate] || {}),
      selected: true,
      selectedColor: Colors.blue30,
    };
    return m;
  }, [safeAppointments, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const todays = useMemo<Appointment[]>(() => {
    return safeAppointments.filter(
      (ap) => ap.start_time.slice(0, 10) === selectedDate
    );
  }, [safeAppointments, selectedDate]);

  const handleCancel = async (appointment: Appointment) => {
    try {
      await updateAppointment(appointment.id, {
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        status: "cancelled",
      });
      refresh();
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Erro ao cancelar agendamento");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.blue30} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text text70 red30>
          {error}
        </Text>
        <Text link onPress={refresh} marginT-16>
          Tentar novamente
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Calendar
        style={styles.calendar}
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        theme={{
          todayTextColor: Colors.blue30,
          arrowColor: Colors.blue30,
          dotColor: Colors.blue30,
          selectedDayBackgroundColor: Colors.blue30,
        }}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>
          {formatLocalDateString(selectedDate)}
        </Text>
      </View>

      {todays.length === 0 ? (
        <View style={styles.centered}>
          <Text text90 grey40>
            Sem agendamentos para essa data.
          </Text>
        </View>
      ) : (
        <FlatList
          data={todays}
          keyExtractor={(item) => String(item.id)}
          numColumns={columns}
          columnWrapperStyle={
            columns > 1
              ? {
                  flex: 1,
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  paddingHorizontal: PADDING,
                  gap: 16,
                }
              : undefined
          }
          contentContainerStyle={{
            paddingHorizontal: PADDING,
            paddingTop: 12,
            paddingBottom: 24,
            alignItems: columns === 1 ? "center" : "stretch",
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4f46e5"]}
              tintColor="#4f46e5"
            />
          }
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              onPress={() =>
                (navigation as any).navigate("AppointmentDetail", {
                  appointment: item,
                })
              }
              onCancel={() => handleCancel(item)}
              onJoinMeeting={() => {
                // TODO: Navigate to video call screen or open meeting URL
                Alert.alert(
                  "Entrar na sala",
                  `Iniciando videochamada para consulta com ${item.professional_name}`,
                  [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Entrar",
                      onPress: () => {
                        // TODO: Implement video call navigation
                        console.log(
                          "Joining meeting for appointment:",
                          item.id
                        );
                      },
                    },
                  ]
                );
              }}
            />
          )}
        />
      )}

      <AppointmentModal
        visible={!!editingAppointment}
        onClose={() => setEditingAppointment(null)}
        onDone={() => {
          setEditingAppointment(null);
          refresh();
        }}
        professionalId={editingAppointment?.professional_id ?? 0}
        appointmentToEdit={editingAppointment ?? undefined}
      />
    </SafeAreaView>
  );
};

export default AppointmentsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  calendar: {
    width: "100%",
    height: CALENDAR_HEIGHT,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.grey70,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
