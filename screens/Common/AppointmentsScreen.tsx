import React, { useEffect, useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Text, Colors } from 'react-native-ui-lib';
import { Calendar, DateData, MarkedDates } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/ProfileStack';
import { useMyAppointments } from '@/hooks/useAppointments';
import { Appointment } from '@/types/appointment';
import { AppointmentCard } from '@/components/AppointmentCard';

const CALENDAR_HEIGHT = 350;

type Props = NativeStackScreenProps<ProfileStackParamList, 'Appointments'>;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatLocalDateString(dateString: string) {
  const [y, m, d] = dateString.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

export const AppointmentsScreen: React.FC<Props> = ({ navigation }) => {
  const { appointments, loading, error, refresh } = useMyAppointments();
  const safeAppointments = appointments ?? [];

  const today = new Date();
  const initialDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
    today.getDate()
  )}`;

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);

  const markedDates = useMemo<MarkedDates>(() => {
    const m: MarkedDates = {};
    safeAppointments.forEach(ap => {
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

  const todays = useMemo<Appointment[]>(() => {
    return safeAppointments.filter(
      ap => ap.start_time.slice(0, 10) === selectedDate
    );
  }, [safeAppointments, selectedDate]);

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
        <Text text70 red30>{error}</Text>
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
          <Text text90 grey40>Sem agendamentos para essa data.</Text>
        </View>
      ) : (
        <FlatList
          data={todays}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <AppointmentCard
              appointment={item}
              onPress={() =>
                navigation.navigate('ProfessionalDetail', {
                  profileId: String(item.professional_id),
                })
              }
              onEdit={() => {
                /* TODO: abrir modal de edição de data */
              }}
              onCancel={() => {
                /* TODO: chamar API de cancelar */
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default AppointmentsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '600',
    margin: 16,
  },
  calendar: {
    width: '100%',
    height: CALENDAR_HEIGHT,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.grey70,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

