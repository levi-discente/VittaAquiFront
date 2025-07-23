import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Text, Button, Colors } from 'react-native-ui-lib';
import { updateAppointment, createAppointment } from '@/api/appointment';
import { Appointment } from '@/types/appointment';
import { Snackbar } from './Snackbar';
import { useProfessionalAppointmentData } from '@/hooks/useProfessionalAppointmentData';
import { Ionicons } from '@expo/vector-icons';

export type AppointmentModalProps = {
  visible: boolean;
  onClose: () => void;
  professionalId: number;
  appointmentToEdit?: Appointment;
  onDone: () => void;
  slotInterval?: number;
  daysAhead?: number;
  durationMinutes?: number;
};

const daysMap = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];
const { width } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(width * 0.9, 400);

type Slot = { time: Date; available: boolean };

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  visible, onClose, onDone,
  professionalId, appointmentToEdit,
  slotInterval = 60, daysAhead = 14, durationMinutes = 60,
}) => {
  const {
    loading,
    error,
    workingDays,
    workingHours,
    existingAppointments,
  } = useProfessionalAppointmentData(professionalId, visible);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [busyRanges, setBusyRanges] = useState<{ start: Date; end: Date }[]>([]);
  const [loadingOp, setLoadingOp] = useState(false);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  useEffect(() => {
    const ranges = (existingAppointments || []).map(a => ({
      start: new Date(a.start),
      end: new Date(a.end),
    }));
    setBusyRanges(ranges);
  }, [existingAppointments]);

  useEffect(() => {
    if (visible && appointmentToEdit) {
      const start = new Date(appointmentToEdit.start_time);
      setSelectedDate(start);
      setSelectedTime(start);
    } else if (visible) {
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [visible, appointmentToEdit]);

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

  const computeSlots = useCallback((date: Date): Slot[] => {
    const [sh, sm] = (workingHours.start || '08:00').split(':').map(Number);
    const [eh, em] = (workingHours.end || '18:00').split(':').map(Number);
    const start = new Date(date); start.setHours(sh, sm, 0, 0);
    const end = new Date(date); end.setHours(eh, em, 0, 0);
    let cursor = new Date(start);
    const now = new Date();
    const slots: Slot[] = [];
    while (cursor < end) {
      const conflict = busyRanges.some(r => cursor >= r.start && cursor < r.end);
      const isPast = date.toDateString() === now.toDateString() && cursor < now;
      slots.push({ time: new Date(cursor), available: !conflict && !isPast });
      cursor = new Date(cursor.getTime() + slotInterval * 60000);
    }
    return slots;
  }, [workingHours, busyRanges, slotInterval]);

  const dayHasFreeSlots = useCallback((d: Date) => {
    if (!workingDays.includes(daysMap[d.getDay()])) return false;
    return computeSlots(d).some(s => s.available);
  }, [workingDays, computeSlots]);

  const slots = useMemo(() => selectedDate ? computeSlots(selectedDate) : [], [selectedDate, computeSlots]);

  const handleConfirm = async () => {
    if (!selectedTime) return;
    setLoadingOp(true);
    const stISO = selectedTime.toISOString();
    const enISO = new Date(selectedTime.getTime() + durationMinutes * 60000).toISOString();
    try {
      if (appointmentToEdit) {
        await updateAppointment(appointmentToEdit.id, {
          start_time: stISO,
          end_time: enISO,
          status: appointmentToEdit.status
        });
        setSnackbar({ visible: true, message: 'Agendamento atualizado!' });
      } else {
        await createAppointment({
          professional_id: professionalId,
          start_time: stISO,
          end_time: enISO
        });
        setSnackbar({ visible: true, message: 'Agendamento criado!' });
      }
      onDone();
      onClose();
    } catch (err: any) {
      setSnackbar({ visible: true, message: err.message || 'Erro na operação' });
    } finally {
      setLoadingOp(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToEdit) return;
    setLoadingOp(true);
    try {
      await updateAppointment(appointmentToEdit.id, {
        start_time: appointmentToEdit.start_time,
        end_time: appointmentToEdit.end_time,
        status: 'cancelled'
      });
      setSnackbar({ visible: true, message: 'Agendamento cancelado!' });
      onDone();
      onClose();
    } catch (err: any) {
      setSnackbar({ visible: true, message: err.message || 'Erro ao cancelar' });
    } finally {
      setLoadingOp(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => { }} style={styles.container}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.blue30} />
          ) : error ? (
            <Text text70 red30>{error}</Text>
          ) : (
            <>
              <FlatList
                horizontal
                data={days}
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
                      <Text style={(!isWorkday || !hasFree) ? styles.dayTextDisabled : styles.dayText}>{label}</Text>
                      <Text style={(!isWorkday || !hasFree) ? styles.dayTextDisabled : styles.dayText}>{num}</Text>
                    </TouchableOpacity>
                  );
                }}
              />

              {selectedDate ? (
                <FlatList
                  data={slots}
                  keyExtractor={s => s.time.toISOString()}
                  numColumns={3}
                  contentContainerStyle={styles.slots}
                  renderItem={({ item }) => {
                    const lbl = item.time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    const isSel = selectedTime?.getTime() === item.time.getTime();
                    const isOld = appointmentToEdit && item.time.getTime() === new Date(appointmentToEdit.start_time).getTime();
                    return (
                      <TouchableOpacity
                        disabled={!item.available}
                        onPress={() => setSelectedTime(item.time)}
                        style={[
                          styles.slotBtn,
                          isOld ? styles.slotOld :
                            item.available
                              ? (isSel ? styles.slotSelected : styles.slotEnabled)
                              : styles.slotUnavailable,
                        ]}
                      >
                        <View style={styles.slotContent}>
                          <Text style={
                            isOld ? styles.slotTextOld :
                              item.available
                                ? (isSel ? styles.slotTextSelected : styles.slotText)
                                : styles.slotTextUnavailable
                          }>
                            {lbl}
                          </Text>
                          {isOld && <Ionicons name="calendar-outline" size={16} color={Colors.blue30} style={styles.slotIcon} />}
                          {isSel && !isOld && <Ionicons name="checkmark-circle" size={16} color={Colors.green30} style={styles.slotIcon} />}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text text90 grey40 center>Selecione um dia disponível</Text>
                </View>
              )}

              <View style={styles.footer}>
                <Button label="Fechar" link onPress={onClose} style={styles.footerBtn} />
                <Button
                  label={appointmentToEdit ? "Salvar" : "Confirmar"}
                  disabled={!selectedTime || loadingOp}
                  onPress={handleConfirm}
                  style={[styles.footerBtn, (!selectedTime || loadingOp) && styles.disabledBtn]}
                />
              </View>
            </>
          )}

          <Snackbar
            visible={snackbar.visible}
            message={snackbar.message}
            onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
          />
        </TouchableOpacity>
      </TouchableOpacity>
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
  slotBtn: { flex: 1, margin: 4, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  slotEnabled: { backgroundColor: Colors.blue60 },
  slotSelected: { backgroundColor: Colors.green30 },
  slotOld: { backgroundColor: Colors.blue70 },
  slotUnavailable: { backgroundColor: Colors.grey40 },

  slotText: { color: '#fff' },
  slotTextSelected: { color: '#fff', fontWeight: '600' },
  slotTextUnavailable: { color: '#666' },
  slotTextOld: { color: '#fff', fontWeight: 'bold' },

  slotContent: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  slotIcon: { marginLeft: 4 },

  placeholder: { paddingVertical: 32, justifyContent: 'center' },

  footer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, flexWrap: 'wrap' },
  footerBtn: { marginLeft: 8, marginTop: 8 },
  disabledBtn: { backgroundColor: Colors.grey40 },
});
