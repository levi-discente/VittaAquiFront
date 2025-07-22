import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Text, Button, Colors } from 'react-native-ui-lib';

export type AppointmentModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (startISO: string, endISO: string) => void;
  /** Dias da semana em que o profissional atende */
  workingDays: string[];
  /** Horário de início e fim no formato 'HH:mm' */
  workingHours: { start: string; end: string };
  /** Agendamentos já existentes para esse profissional (ISO strings) */
  existingAppointments?: { start: string; end: string }[];
  slotInterval?: number;
  daysAhead?: number;
  durationMinutes?: number;
};

const daysMap = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

const { width } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(width * 0.9, 400);

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  visible, onCancel, onConfirm,
  workingDays, workingHours,
  existingAppointments = [],
  slotInterval = 60,
  daysAhead = 14,
  durationMinutes = 60,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  // prepare next days
  const days = useMemo(() => {
    const arr: Date[] = [];
    const today = new Date();
    for (let i = 0; i < daysAhead; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [daysAhead, visible]);

  // parse existing appointments once
  const apptRanges = useMemo(() => {
    return existingAppointments.map(a => ({
      start: new Date(a.start),
      end: new Date(a.end),
    }));
  }, [existingAppointments]);

  // build slots for a given date, filtering out conflicts
  const computeSlots = (date: Date): Date[] => {
    const slots: Date[] = [];
    const [sh, sm] = workingHours.start.split(':').map(Number);
    const [eh, em] = workingHours.end.split(':').map(Number);

    const start = new Date(date); start.setHours(sh, sm, 0, 0);
    const end = new Date(date); end.setHours(eh, em, 0, 0);

    let cursor = new Date(start);
    while (cursor < end) {
      // skip past times if today
      if (
        cursor > new Date() ||
        cursor.toDateString() !== new Date().toDateString()
      ) {
        // check conflict
        const conflict = apptRanges.some(r =>
          cursor >= r.start && cursor < r.end
        );
        if (!conflict) slots.push(new Date(cursor));
      }
      cursor = new Date(cursor.getTime() + slotInterval * 60_000);
    }
    return slots;
  };

  // for each day, know if it has any free slots
  const dayHasFreeSlots = (day: Date) => {
    // only if weekday is in workingDays
    if (!workingDays.includes(daysMap[day.getDay()])) return false;
    return computeSlots(day).length > 0;
  };

  // once you pick a day, generate its slots
  const slots = useMemo(() => {
    return selectedDate ? computeSlots(selectedDate) : [];
  }, [selectedDate, apptRanges]);

  // reset on open
  useEffect(() => {
    if (visible) {
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [visible]);

  const handleConfirm = () => {
    if (!selectedTime) return;
    const st = selectedTime;
    const en = new Date(st.getTime() + durationMinutes * 60_000);
    onConfirm(st.toISOString(), en.toISOString());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Calendar */}
          <FlatList
            horizontal data={days}
            keyExtractor={d => d.toISOString()}
            contentContainerStyle={styles.calendar}
            renderItem={({ item }) => {
              const wd = item.getDay();
              const label = item.toLocaleDateString('pt-BR', { weekday: 'short' });
              const num = item.getDate();
              const isWorkday = workingDays.includes(daysMap[wd]);
              const hasFree = dayHasFreeSlots(item);
              const isSel = selectedDate?.toDateString() === item.toDateString();

              return (
                <TouchableOpacity
                  disabled={!(isWorkday && hasFree)}
                  onPress={() => setSelectedDate(item)}
                  style={[
                    styles.dayBtn,
                    !isWorkday || !hasFree ? styles.dayDisabled : styles.dayEnabled,
                    isSel && styles.daySelected,
                  ]}
                >
                  <Text style={(!isWorkday || !hasFree) ? styles.dayTextDisabled : styles.dayText}>
                    {label}
                  </Text>
                  <Text style={(!isWorkday || !hasFree) ? styles.dayTextDisabled : styles.dayText}>
                    {num}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* Time slots */}
          {selectedDate ? (
            <FlatList
              data={slots}
              keyExtractor={d => d.toISOString()}
              numColumns={3}
              contentContainerStyle={styles.slots}
              renderItem={({ item }) => {
                const lbl = item.toLocaleTimeString('pt-BR', {
                  hour: '2-digit', minute: '2-digit'
                });
                const isSel = selectedTime?.getTime() === item.getTime();
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedTime(item)}
                    style={[
                      styles.slotBtn,
                      isSel ? styles.slotSelected : styles.slotEnabled,
                    ]}
                  >
                    <Text style={isSel ? styles.slotTextSelected : styles.slotText}>
                      {lbl}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text text90 grey40 center>
                Selecione um dia com horários disponíveis
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.footer}>
            <Button label="Cancelar" link onPress={onCancel} style={styles.footerBtn} />
            <Button
              label="Confirmar"
              disabled={!selectedTime}
              onPress={handleConfirm}
              style={[styles.footerBtn, !selectedTime && styles.disabledBtn]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16,
  },
  container: {
    width: '100%', maxWidth: MODAL_WIDTH,
    backgroundColor: '#fff', borderRadius: 8, padding: 16,
  },
  calendar: { paddingVertical: 8 },
  dayBtn: {
    width: 60, height: 80, marginHorizontal: 4,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  dayEnabled: { backgroundColor: Colors.blue60 },
  dayDisabled: { backgroundColor: Colors.grey70 },
  daySelected: { borderWidth: 2, borderColor: Colors.green30 },
  dayText: { color: '#fff', fontWeight: '600' },
  dayTextDisabled: { color: '#ccc' },

  slots: { marginTop: 16, justifyContent: 'center' },
  slotBtn: {
    flex: 1, margin: 4, paddingVertical: 8,
    borderRadius: 6, alignItems: 'center',
  },
  slotEnabled: { backgroundColor: Colors.blue60 },
  slotSelected: { backgroundColor: Colors.green30 },
  slotText: { color: '#fff' },
  slotTextSelected: { color: '#fff', fontWeight: '600' },

  placeholder: { paddingVertical: 32, justifyContent: 'center' },

  footer: {
    flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24,
  },
  footerBtn: { marginLeft: 8 },
  disabledBtn: { backgroundColor: Colors.grey40 },
});
