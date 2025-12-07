import api from "./api";

export interface BackendChatMessage {
  id: number;
  appointment_id: number;
  sender_user_id: number;
  sender_name: string;
  sender_image_url?: string;
  content: string;
  created_at: string;
  temp_id?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
}

export const getAppointmentMessages = async (
  appointmentId: number
): Promise<BackendChatMessage[]> => {
  const response = await api.get<BackendChatMessage[]>(
    `/appointments/${appointmentId}/messages`
  );
  return response.data;
};

export const uploadChatFile = async (
  appointmentId: number,
  file: any
): Promise<{
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/appointments/${appointmentId}/upload-file`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
