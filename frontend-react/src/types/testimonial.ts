export interface Testimonial {
  id: string;
  productId: string;
  userName: string;
  userId: string | null;
  comment: string;
  rating: number;
  approved: boolean;
  createdAt: string;
}

export interface TestimonialFormData {
  productId: string;
  userId: string;
  userName: string;
  comment: string;
  rating: number;
  approved: boolean;
  createdAt: string;
}

export interface TestimonialResponse {
  success: boolean;
  data?: Testimonial[];
  error?: string;
}

export interface CreateTestimonialResponse {
  success: boolean;
  data?: Testimonial;
  error?: string;
}
