import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  workingDays: string[];
  workingHours: { start: string; end: string };
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

type Slot = { time: Date; available: boolean };

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

  // next N days
  const days = useMemo(() => {
    const arr: Date[] = [];
    const today = new Date();
    for (let i = 0; i < daysAhead; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [daysAhead]);

  const apptRanges = useMemo(() => {
    return existingAppointments.map(a => ({
      start: new Date(a.start),
      end: new Date(a.end),
    }));
  }, [existingAppointments]);

  const computeSlots = useCallback((date: Date): Slot[] => {
    const slots: Slot[] = [];
    const [sh, sm] = workingHours.start.split(':').map(Number);
    const [eh, em] = workingHours.end.split(':').map(Number);
    const start = new Date(date); start.setHours(sh, sm, 0, 0);
    const end = new Date(date); end.setHours(eh, em, 0, 0);

    let cursor = new Date(start);
    while (cursor < end) {
      const now = new Date();
      const isPast = cursor < now && cursor.toDateString() === now.toDateString();
      const conflict = apptRanges.some(r =>
        cursor >= r.start && cursor < r.end
      );
      slots.push({
        time: new Date(cursor),
        available: !conflict && !isPast,
      });
      cursor = new Date(cursor.getTime() + slotInterval * 60_000);
    }
    return slots;
  }, [workingHours, apptRanges, slotInterval]);

  const dayHasFreeSlots = useCallback((day: Date) => {
    if (!workingDays.includes(daysMap[day.getDay()])) return false;
    return computeSlots(day).some(s => s.available);
  }, [workingDays, computeSlots]);

  const slots = useMemo<Slot[]>(() => {
    return selectedDate ? computeSlots(selectedDate) : [];
  }, [selectedDate, computeSlots]);

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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Calendar */}
          <FlatList
            horizontal
            data={days}
            keyExtractor={d => d.toISOString()}
            contentContainerStyle={styles.calendar}
            renderItem={({ item }) => {
              const dayName = item.toLocaleDateString('pt-BR', { weekday: 'short' });
              const dayNum = item.getDate();
              const isWorkday = workingDays.includes(daysMap[item.getDay()]);
              const hasFree = dayHasFreeSlots(item);
              const isSelected = selectedDate?.toDateString() === item.toDateString();
              return (
                <TouchableOpacity
                  disabled={!isWorkday || !hasFree}
                  onPress={() => setSelectedDate(item)}
                  style={[
                    styles.dayBtn,
                    !isWorkday || !hasFree ? styles.dayDisabled : styles.dayEnabled,
                    isSelected && styles.daySelected,
                  ]}
                >
                  <Text style={!isWorkday || !hasFree ? styles.dayTextDisabled : styles.dayText}>
                    {dayName}
                  </Text>
                  <Text style={!isWorkday || !hasFree ? styles.dayTextDisabled : styles.dayText}>
                    {dayNum}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* Time slots */}
          {selectedDate ? (
            <FlatList
              data={slots}
              keyExtractor={s => s.time.toISOString()}
              numColumns={3}
              contentContainerStyle={styles.slots}
              renderItem={({ item }) => {
                const label = item.time.toLocaleTimeString('pt-BR', {
                  hour: '2-digit', minute: '2-digit'
                });
                const isSelected = selectedTime?.getTime() === item.time.getTime();
                return (
                  <TouchableOpacity
                    disabled={!item.available}
                    onPress={() => setSelectedTime(item.time)}
                    style={[
                      styles.slotBtn,
                      item.available
                        ? (isSelected ? styles.slotSelected : styles.slotEnabled)
                        : styles.slotUnavailable,
                    ]}
                  >
                    <Text style={
                      item.available
                        ? (isSelected ? styles.slotTextSelected : styles.slotText)
                        : styles.slotTextUnavailable
                    }>
                      {label}
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

          {/* Footer */}
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
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    maxWidth: MODAL_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  calendar: { paddingVertical: 8 },
  dayBtn: {
    width: 60,
    height: 80,
    marginHorizontal: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayEnabled: { backgroundColor: Colors.blue60 },
  dayDisabled: { backgroundColor: Colors.grey70 },
  daySelected: { borderWidth: 2, borderColor: Colors.green30 },
  dayText: { color: '#fff', fontWeight: '600' },
  dayTextDisabled: { color: '#ccc' },

  slots: { marginTop: 16, justifyContent: 'center' },
  slotBtn: {
    flex: 1,
    margin: 4,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  slotEnabled: { backgroundColor: Colors.blue60 },
  slotSelected: { backgroundColor: Colors.green30 },
  slotUnavailable: { backgroundColor: Colors.grey40 },
  slotText: { color: '#fff' },
  slotTextSelected: { color: '#fff', fontWeight: '600' },
  slotTextUnavailable: { color: '#666' },

  placeholder: { paddingVertical: 32, justifyContent: 'center' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  footerBtn: { marginLeft: 8 },
  disabledBtn: { backgroundColor: Colors.grey40 },
});

