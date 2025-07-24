import { useCallback, useEffect, useState } from 'react';
import {
  getProfessionalProfileById,
  getProfessionalProfileByUserId,
  listProfessionals
} from '@/api/professional';
import {
  ProfessionalFilter,
  ProfessionalProfile
} from '@/types/professional';

export const useProfessionals = (filters: ProfessionalFilter) => {
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listProfessionals(filters);
      setProfessionals(list);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ??
        err.message ??
        'Erro ao buscar profissionais.'
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { professionals, loading, error, refresh: fetchList };
};

export const useProfessionalProfile = (profileId: string) => {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfessionalProfileById(profileId);
      setProfile(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ??
        err.message ??
        'Erro ao carregar perfil.'
      );
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refresh: fetchProfile };
};

export const useProfessionalProfileByUserId = (userId: number) => {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfessionalProfileByUserId(userId);
      setProfile(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ??
        err.message ??
        'Erro ao carregar perfil.'
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refresh: fetchProfile };
};

