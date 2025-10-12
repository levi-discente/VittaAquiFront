import { useState, useEffect, useCallback } from 'react';
import {
  getMyAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../api/appointment';
import {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData
} from '../types/appointment';

/**
 * Hook para listar e gerenciar agendamentos do paciente logado
 */
export function useMyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getMyAppointments();
      setAppointments(list);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    appointments,
    loading,
    error,
    refresh: fetch,
    create: createAppointment,
    update: updateAppointment,
    remove: deleteAppointment,
  };
}

