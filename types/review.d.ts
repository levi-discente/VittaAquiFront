export interface PatientInfo {
  id: number;
  name: string;
  profile_image_url?: string;
}

export interface Review {
  id: number;
  appointment_id: number;
  patient_id: number;
  professional_id: number;
  rating: number;
  comment: string | null;
  is_anonymous: boolean;
  patient?: PatientInfo;
  created_at: string;
  updated_at: string;
}

export interface ReviewCreate {
  appointment_id: number;
  rating: number;
  comment?: string;
  is_anonymous?: boolean;
}

export interface ReviewUpdate {
  rating?: number;
  comment?: string;
}

export interface ReviewList {
  total: number;
  items: Review[];
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  distribution: Record<string, number>;
}

export interface ReviewSummary {
  id: number;
  rating: number;
  comment: string | null;
  patient_name?: string;
  is_anonymous: boolean;
  created_at: string;
}
