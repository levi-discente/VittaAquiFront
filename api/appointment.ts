import api from './api';
import {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentData
} from '../types/appointment';

const BASE = '/appointments';

export const createAppointment = async (
  data: CreateAppointmentData
): Promise<Appointment> => {
  const response = await api.post<Appointment>(`${BASE}/`, data);
  return response.data;
};

export const getMyAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>(`${BASE}/my`);
  return response.data;
};

export const getProfessionalSchedule = async (
  professionalId: number
): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>(
    `${BASE}/professional/${professionalId}`
  );
  return response.data;
};

export const updateAppointment = async (
  id: number,
  data: UpdateAppointmentData
): Promise<Appointment> => {
  const response = await api.put<Appointment>(`${BASE}/${id}`, data);
  return response.data;
};

export const deleteAppointment = async (id: number): Promise<void> => {
  await api.delete(`${BASE}/${id}`);
};
