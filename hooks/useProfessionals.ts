import { useEffect, useState } from 'react';
import { listProfessionals } from '../api/professional';
import { ProfessionalProfile, ProfessionalFilters } from '../types/professional';

export const useProfessionals = (filters?: ProfessionalFilters) => {
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listProfessionals(filters);
      setProfessionals(response.professionals);
    } catch (err) {
      console.log(err);
      setError('Erro ao buscar profissionais.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [filters]);

  return { professionals, loading, error, refresh: fetchProfessionals };
};
