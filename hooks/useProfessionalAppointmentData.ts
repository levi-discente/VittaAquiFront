import { getProfessionalSchedule } from '@/api/appointment';
import { getProfessionalProfileById } from '@/api/professional';
import { useCallback, useEffect, useState } from 'react';
import { Appointment } from '@/types/appointment';

export function useProfessionalAppointmentData(professionalId: number, trigger: any) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '18:00' });

  // agora com tipo completo
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getProfessionalProfileById(String(professionalId));
      const appointments: Appointment[] = await getProfessionalSchedule(professionalId);

      setWorkingDays(profile.availableDaysOfWeek);
      setWorkingHours({ start: profile.startHour, end: profile.endHour });
      setExistingAppointments(appointments ?? []);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, trigger]);

  return { loading, error, workingDays, workingHours, existingAppointments, refetch: fetchData };
}

