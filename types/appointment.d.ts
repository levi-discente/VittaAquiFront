export interface Appointment {
  id: number;
  patient_id: number;
  patient_name?: string;
  professional_id: number;
  professional_name?: string;
  start_time: string;
  end_time: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  professional_id: number;
  start_time: string;
  end_time: string;
}

export interface UpdateAppointmentData {
  start_time: string;
  end_time: string;
  status: string;
}
