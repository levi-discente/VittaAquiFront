import React, { useEffect, useState, useMemo } from 'react'
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { Text, Colors } from 'react-native-ui-lib'
import { Calendar, DateData, MarkedDates } from 'react-native-calendars'
import { useMyAppointments } from '@/hooks/useAppointments'
import { Appointment } from '@/types/appointment'

const MyAppointmentsScreen: React.FC = () => {
  const { appointments, loading, error, refresh } = useMyAppointments()
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  )

  // marcações no calendário: dia com compromisso ganha um ponto azul
  const marked = useMemo<MarkedDates>(() => {
    const m: MarkedDates = {}
    appointments.forEach(ap => {
      const day = ap.start_time.slice(0, 10) // "YYYY-MM-DD"
      m[day] = { marked: true, dotColor: Colors.blue30 }
    })
    // marca o selecionado com fundo azul
    if (m[selectedDate]) {
      m[selectedDate] = { ...m[selectedDate], selected: true, selectedColor: Colors.blue30 }
    } else {
      m[selectedDate] = { selected: true, selectedColor: Colors.blue30 }
    }
    return m
  }, [appointments, selectedDate])

  // filtra compromissos do dia selecionado
  const todays = useMemo<Appointment[]>(() => {
    return appointments.filter(ap => ap.start_time.slice(0, 10) === selectedDate)
  }, [appointments, selectedDate])

  useEffect(() => {
    // título da tela
    // @ts-ignore
    MyAppointmentsScreen.navigationOptions = { title: 'Meus Agendamentos' }
  }, [])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.blue30} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text text70 red30>{error}</Text>
        <Text link onPress={refresh} marginT-16>
          Tentar novamente
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={marked}
        theme={{
          todayTextColor: Colors.blue30,
          arrowColor: Colors.blue30,
        }}
      />

      <View style={styles.listHeader}>
        <Text text70>
          {new Date(selectedDate).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </Text>
      </View>

      {todays.length === 0 ? (
        <View style={styles.noAppt}>
          <Text text90 grey40>Nenhum compromisso neste dia</Text>
        </View>
      ) : (
        <FlatList
          data={todays}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.time}>
                <Text text80>{new Date(item.start_time).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}</Text>
                <Text text80 grey40>–</Text>
                <Text text80>{new Date(item.end_time).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}</Text>
              </View>
              <View style={styles.info}>
                <Text text90M>{item.professionalName}</Text>
                <Text text90 grey40>{item.status}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  listHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  noAppt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  time: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 12,
  },
})

export default MyAppointmentsScreen
