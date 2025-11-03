import api from "./api";
import { ProfessionalProfile, ProfessionalFilter } from "../types/professional";

interface RawUnavailableDate {
  id: number;
  profile_id: number;
  date: string;
  reason: string;
}

interface RawProfessional {
  id: number;
  user_id: number;
  user_name: string;
  email: string;
  phone: string;
  cep: string;
  uf: string;
  city: string;
  address: string;
  bio: string;
  category: string;
  services: string;
  profissional_identification: string;
  price: number;
  tags: string[];
  only_online: boolean;
  only_presential: boolean;
  rating: number;
  num_reviews: number;
  image_url?: string;
  available_days_of_week: string; // CSV string from backend
  start_hour: string;
  end_hour: string;
  unavailable_dates: RawUnavailableDate[] | null; // aceita null
}

export const createProfessionalProfile = async (
  data: Partial<ProfessionalProfile>
): Promise<ProfessionalProfile> => {
  const response = await api.post<ProfessionalProfile>("/professionals/", data);
  return response.data;
};

export const getProfessionalProfileById = async (
  profileId: string
): Promise<ProfessionalProfile> => {
  const response = await api.get<RawProfessional>(
    `/professionals/${profileId}`
  );
  const p = response.data;
  const rawUnavailable = p.unavailable_dates ?? [];
  return {
    id: String(p.id),
    userId: String(p.user_id),
    userName: p.user_name,
    email: p.email,
    phone: p.phone,
    cep: p.cep,
    uf: p.uf,
    city: p.city,
    address: p.address,
    bio: p.bio,
    category: p.category,
    profissionalIdentification: p.profissional_identification,
    services: p.services ? p.services.split(",").filter((s) => !!s) : [],
    price: p.price,
    tags: p.tags,
    onlyOnline: p.only_online,
    onlyPresential: p.only_presential,
    rating: p.rating,
    numReviews: p.num_reviews,
    imageUrl: p.image_url,

    // mapeamento dos novos campos
    availableDaysOfWeek: p.available_days_of_week ? p.available_days_of_week.split(",").filter((d) => !!d.trim()) : [],
    startHour: p.start_hour || "",
    endHour: p.end_hour || "",
    unavailableDates: rawUnavailable.map((d) => ({
      id: d.id,
      profileId: d.profile_id,
      date: d.date,
      reason: d.reason,
    })),
  };
};

export const listProfessionals = async (
  filters: ProfessionalFilter
): Promise<ProfessionalProfile[]> => {
  const response = await api.get<RawProfessional[]>("/professionals/", {
    params: filters,
  });
  return response.data.map((p) => {
    const rawUnavailable = p.unavailable_dates ?? [];
    return {
      id: String(p.id),
      userId: String(p.user_id),
      userName: p.user_name,
      email: p.email,
      phone: p.phone,
      cep: p.cep,
      uf: p.uf,
      city: p.city,
      address: p.address,
      bio: p.bio,
      category: p.category,
      profissionalIdentification: p.profissional_identification,
      services: p.services ? p.services.split(",").filter((s) => !!s) : [],
      price: p.price,
      tags: p.tags,
      onlyOnline: p.only_online,
      onlyPresential: p.only_presential,
      rating: p.rating,
      numReviews: p.num_reviews,
      imageUrl: p.image_url,

      // novos campos
      availableDaysOfWeek: p.available_days_of_week ? p.available_days_of_week.split(",").filter((d) => !!d.trim()) : [],
      startHour: p.start_hour || "",
      endHour: p.end_hour || "",
      unavailableDates: rawUnavailable.map((d) => ({
        id: d.id,
        profileId: d.profile_id,
        date: d.date,
        reason: d.reason,
      })),
    };
  });
};
export const getProfessionalProfileByUserId = async (
  userId: number
): Promise<ProfessionalProfile> => {
  const response = await api.get<RawProfessional>(
    `/professional/user/${userId}`
  );
  const p = response.data;
  const rawUnavailable = p.unavailable_dates ?? [];
  return {
    id: String(p.id),
    userId: String(p.user_id),
    userName: p.user_name,
    email: p.email,
    phone: p.phone,
    cep: p.cep,
    uf: p.uf,
    city: p.city,
    address: p.address,
    bio: p.bio,
    category: p.category,
    profissionalIdentification: p.profissional_identification,
    services: p.services ? p.services.split(",").filter((s) => !!s) : [],
    price: p.price,
    tags: p.tags,
    onlyOnline: p.only_online,
    onlyPresential: p.only_presential,
    rating: p.rating,
    numReviews: p.num_reviews,
    imageUrl: p.image_url,

    // mapeamento dos novos campos
    availableDaysOfWeek: p.available_days_of_week ? p.available_days_of_week.split(",").filter((d) => !!d.trim()) : [],
    startHour: p.start_hour || "",
    endHour: p.end_hour || "",
    unavailableDates: rawUnavailable.map((d) => ({
      id: d.id,
      profileId: d.profile_id,
      date: d.date,
      reason: d.reason,
    })),
  };
};

export interface UpdateProfessionalPayload {
  bio?: string;
  category?: string;
  profissional_identification?: string;
  services?: string; // CSV string for backend
  price?: number;
  tags?: string[];
  only_online?: boolean;
  only_presential?: boolean;
  address?: string;
  city?: string;
  uf?: string;
  cep?: string;
  start_hour?: string;
  end_hour?: string;
  available_days_of_week?: string; // CSV string for backend
  unavailable_dates?: Array<{ date: string; reason?: string }>;
}

export const updateProfessionalProfile = async (
  profileId: string | number,
  data: UpdateProfessionalPayload
): Promise<ProfessionalProfile> => {
  const response = await api.put<RawProfessional>(
    `/professionals/${profileId}`,
    data
  );
  const p = response.data;
  const rawUnavailable = p.unavailable_dates ?? [];
  return {
    id: String(p.id),
    userId: String(p.user_id),
    userName: p.user_name,
    email: p.email,
    phone: p.phone,
    cep: p.cep,
    uf: p.uf,
    city: p.city,
    address: p.address,
    bio: p.bio,
    category: p.category,
    profissionalIdentification: p.profissional_identification,
    services: p.services ? p.services.split(",").filter((s) => !!s) : [],
    price: p.price,
    tags: p.tags,
    onlyOnline: p.only_online,
    onlyPresential: p.only_presential,
    rating: p.rating,
    numReviews: p.num_reviews,
    imageUrl: p.image_url,
    availableDaysOfWeek: p.available_days_of_week ? p.available_days_of_week.split(",").filter((d) => !!d.trim()) : [],
    startHour: p.start_hour || "",
    endHour: p.end_hour || "",
    unavailableDates: rawUnavailable.map((d) => ({
      id: d.id,
      profileId: d.profile_id,
      date: d.date,
      reason: d.reason,
    })),
  };
};

export const getMyProfessionalProfile =
  async (): Promise<ProfessionalProfile> => {
    const response = await api.get<RawProfessional>("/professionals/me");
    const p = response.data;
    const rawUnavailable = p.unavailable_dates ?? [];
    return {
      id: String(p.id),
      userId: String(p.user_id),
      userName: p.user_name,
      email: p.email,
      phone: p.phone,
      cep: p.cep,
      uf: p.uf,
      city: p.city,
      address: p.address,
      bio: p.bio,
      category: p.category,
      profissionalIdentification: p.profissional_identification,
      services: p.services ? p.services.split(",").filter((s) => !!s) : [],
      price: p.price,
      tags: p.tags,
      onlyOnline: p.only_online,
      onlyPresential: p.only_presential,
      rating: p.rating,
      numReviews: p.num_reviews,
      imageUrl: p.image_url,
      availableDaysOfWeek: p.available_days_of_week ? p.available_days_of_week.split(",").filter((d) => !!d.trim()) : [],
      startHour: p.start_hour || "",
      endHour: p.end_hour || "",
      unavailableDates: rawUnavailable.map((d) => ({
        id: d.id,
        profileId: d.profile_id,
        date: d.date,
        reason: d.reason,
      })),
    };
  };

export const updateMyProfessionalProfile = async (
  data: Partial<ProfessionalProfile>
): Promise<ProfessionalProfile> => {
  const response = await api.put<ProfessionalProfile>(
    "/professionals/me",
    data
  );
  return response.data;
};

export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export interface AvailableSlotsResponse {
  date: string;
  available_slots: TimeSlot[];
  unavailable_reason: string | null;
}

export const getAvailableSlots = async (
  profileId: string | number,
  targetDate: string,
  durationMinutes: number = 60
): Promise<AvailableSlotsResponse> => {
  const response = await api.get<AvailableSlotsResponse>(
    `/professionals/${profileId}/available-slots`,
    {
      params: {
        target_date: targetDate,
        duration_minutes: durationMinutes,
      },
    }
  );
  return response.data;
};
