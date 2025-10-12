import { useState, useEffect, useCallback } from 'react';
import { getAvailableSlots, AvailableSlotsResponse } from '@/api/professional';

export function useAvailableSlots(
  professionalId: string | number,
  targetDate: string,
  durationMinutes: number = 60
) {
  const [slots, setSlots] = useState<AvailableSlotsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    if (!targetDate) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailableSlots(professionalId, targetDate, durationMinutes);
      setSlots(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao carregar slots');
    } finally {
      setLoading(false);
    }
  }, [professionalId, targetDate, durationMinutes]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return {
    slots,
    loading,
    error,
    refresh: fetchSlots,
  };
}
