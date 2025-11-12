import api from "./api";
import type {
  Review,
  ReviewCreate,
  ReviewUpdate,
  ReviewList,
  ReviewStats,
  ReviewSummary,
} from "../types/review";

const BASE = "/reviews";

// Create a review for a completed appointment
export const createReview = async (data: ReviewCreate): Promise<Review> => {
  const response = await api.post<Review>(BASE, data);
  return response.data;
};

// Get my reviews (as patient)
export const getMyReviews = async (
  skip: number = 0,
  limit: number = 100
): Promise<Review[]> => {
  const response = await api.get<Review[]>(`${BASE}/my`, {
    params: { skip, limit },
  });
  return response.data;
};

// Get review by ID
export const getReview = async (reviewId: number): Promise<Review> => {
  const response = await api.get<Review>(`${BASE}/${reviewId}`);
  return response.data;
};

// Update a review
export const updateReview = async (
  reviewId: number,
  data: ReviewUpdate
): Promise<Review> => {
  const response = await api.put<Review>(`${BASE}/${reviewId}`, data);
  return response.data;
};

// Delete a review
export const deleteReview = async (reviewId: number): Promise<void> => {
  await api.delete(`${BASE}/${reviewId}`);
};

// Get review for a specific appointment
export const getAppointmentReview = async (
  appointmentId: number
): Promise<Review | null> => {
  const response = await api.get<Review | null>(
    `${BASE}/appointment/${appointmentId}`
  );
  return response.data;
};

// Get reviews for a professional
export const getProfessionalReviews = async (
  professionalId: number,
  skip: number = 0,
  limit: number = 20
): Promise<ReviewList> => {
  const response = await api.get<ReviewList>(
    `/professionals/${professionalId}/reviews`,
    {
      params: { skip, limit },
    }
  );
  return response.data;
};

// Get review stats for a professional
export const getProfessionalReviewStats = async (
  professionalId: number
): Promise<ReviewStats> => {
  const response = await api.get<ReviewStats>(
    `/professionals/${professionalId}/reviews/stats`
  );
  return response.data;
};

// Count patient reviews for a professional (to check if limit reached)
export const countPatientReviewsForProfessional = async (
  professionalId: number
): Promise<number> => {
  try {
    const myReviews = await getMyReviews();
    const reviewsForThisProfessional = myReviews.filter(
      (review) => review.professional_id === professionalId
    );
    return reviewsForThisProfessional.length;
  } catch (error) {
    console.error("Error counting patient reviews:", error);
    return 0;
  }
};
