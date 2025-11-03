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
  const response = await api.get<Appointment[]>(`${BASE}/my-appointments`);
  return response.data;
};

export const getAppointmentById = async (id: number): Promise<Appointment> => {
  const response = await api.get<Appointment>(`${BASE}/${id}`);
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

export const getProfessionalAppointments = async (
  professionalId: number,
  params?: {
    start_date?: string;
    end_date?: string;
    skip?: number;
    limit?: number;
  }
): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>(
    `/professionals/${professionalId}/appointments`,
    { params }
  );
  return response.data;
};

export const confirmAppointment = async (id: number): Promise<Appointment> => {
  const response = await api.put<Appointment>(`${BASE}/${id}`, {
    status: 'confirmed',
  });
  return response.data;
};

export const cancelAppointment = async (id: number): Promise<Appointment> => {
  const response = await api.put<Appointment>(`${BASE}/${id}`, {
    status: 'cancelled',
  });
  return response.data;
};

export const getPatientAppointments = async (
  patientId: number
): Promise<Appointment[]> => {
  // This will get appointments for a specific patient
  // For now, we'll use the my-appointments endpoint filtered by patient
  const response = await api.get<Appointment[]>(`${BASE}/my-appointments`);
  return response.data.filter((apt) => apt.patient_id === patientId);
};
