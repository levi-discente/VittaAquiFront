import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { Card, Text, Colors, Button } from 'react-native-ui-lib';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Appointment } from '@/types/appointment';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.9, 400);

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: Colors.orange30,
  confirmed: Colors.green30,
  cancelled: Colors.red30,
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'PENDENTE',
  confirmed: 'CONFIRMADO',
  cancelled: 'CANCELADO',
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onPress,
  onEdit,
  onCancel,
}) => {
  const { professional_name, start_time, status } = appointment;
  const dt = new Date(start_time);
  const dateStr = dt.toLocaleDateString('pt-BR');
  const timeStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const badgeColor = STATUS_COLORS[status] ?? Colors.grey40;

  const handleCancelPress = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Tem certeza que deseja cancelar este agendamento?');
      if (confirmed) {
        onCancel();
      }
    } else {
      Alert.alert(
        'Cancelar agendamento',
        'Tem certeza que deseja cancelar este agendamento?',
        [
          { text: 'Não', style: 'cancel' },
          { text: 'Sim', style: 'destructive', onPress: onCancel },
        ]
      );
    }
  };

  const isCancelled = status === 'cancelled';

  return (
    <Card style={[styles.card, { width: CARD_WIDTH }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {/* Cabeçalho e Info */}
        <View style={isCancelled ? { marginBottom: 12 } : { marginBottom: 0 }} >
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{STATUS_LABELS[status] ?? status.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{professional_name}</Text>
          <Text style={styles.info}>{dateStr} • {timeStr}</Text>
        </View>
      </TouchableOpacity>

      {/* Ações */}
      {!isCancelled && (
        <View style={styles.actions}>
          <Button
            link
            onPress={onEdit}
            iconSource={() => (
              <Ionicons name="create-outline" size={16} color={Colors.blue30} />
            )}
            label="Alterar data"
            style={styles.actionBtn}
            labelStyle={styles.actionLabel}
          />
          <Button
            link
            onPress={handleCancelPress}
            iconSource={() => (
              <Ionicons name="close-outline" size={16} color={Colors.red30} />
            )}
            label="Cancelar"
            style={styles.actionBtn}
            labelStyle={[styles.actionLabel, { color: Colors.red30 }]}
          />
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    elevation: 2,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: Colors.grey40,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    marginLeft: 16,
  },
  actionLabel: {
    color: Colors.blue30,
    fontSize: 14,
  },
});

