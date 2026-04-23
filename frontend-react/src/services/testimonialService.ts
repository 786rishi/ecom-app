import { Testimonial, TestimonialFormData, TestimonialResponse, CreateTestimonialResponse } from '../types/testimonial';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 

export const testimonialService = {
  // Get all testimonials for a product
  async getTestimonialsByProductId(productId: string): Promise<TestimonialResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials/${productId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch testimonials'
      };
    }
  },

  // Create a new testimonial
  async createTestimonial(testimonialData: TestimonialFormData): Promise<CreateTestimonialResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonialData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Error creating testimonial:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create testimonial'
      };
    }
  },

  // Calculate average rating from testimonials
  calculateAverageRating(testimonials: Testimonial[]): number {
    if (testimonials.length === 0) return 0;

    const totalRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
    return Math.round((totalRating / testimonials.length) * 10) / 10; // Round to 1 decimal place
  },

  // Get approved testimonials only
  getApprovedTestimonials(testimonials: Testimonial[]): Testimonial[] {
    return testimonials.filter(testimonial => testimonial.approved);
  }
};
