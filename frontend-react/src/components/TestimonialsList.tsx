import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { Testimonial } from '../types/testimonial';
import { testimonialService } from '../services/testimonialService';
import './TestimonialsList.css';

interface TestimonialsListProps {
  productId: string;
  refreshTrigger?: boolean;
}

const TestimonialsList: React.FC<TestimonialsListProps> = ({ productId, refreshTrigger }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      setError(null);
      
      const response = await testimonialService.getTestimonialsByProductId(productId);
      
      if (response.success && response.data) {
        const approvedTestimonials = testimonialService.getApprovedTestimonials(response.data);
        setTestimonials(approvedTestimonials);
        
        const avgRating = testimonialService.calculateAverageRating(approvedTestimonials);
        setAverageRating(avgRating);
      } else {
        setError(response.error || 'Failed to load testimonials');
        setTestimonials([]);
        setAverageRating(0);
      }
      
      setLoading(false);
    };

    fetchTestimonials();
  }, [productId, refreshTrigger]);

  const renderStars = (rating: number) => {
    return (
      <div className="star-rating">
        {'★'.repeat(Math.floor(rating))}
        {rating % 1 !== 0 && '⭐'}
        {'☆'.repeat(Math.max(0, 5 - Math.ceil(rating)))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading testimonials...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="testimonials-section py-5 bg-light">
      <Container>
        {/* Average Rating Box */}
        <div className="avg-rating-box mb-5 p-4 bg-white rounded shadow-sm">
          <Row className="align-items-center">
            <Col md={3} className="text-center">
              <div className="rating-circle">
                <div className="rating-number">{averageRating.toFixed(1)}</div>
                <div className="rating-stars mt-2">
                  {renderStars(averageRating)}
                </div>
              </div>
            </Col>
            <Col md={9}>
              <div className="ps-md-4">
                <h4 className="mb-2">Customer Ratings & Reviews</h4>
                <p className="text-muted mb-0">
                  Based on <strong>{testimonials.length}</strong> verified {testimonials.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Testimonials List */}
        <h4 className="mb-4">Customer Testimonials</h4>
        
        {error && (
          <Alert variant="warning">
            {error}
          </Alert>
        )}

        {testimonials.length === 0 ? (
          <Alert variant="info" className="text-center">
            No testimonials yet. Be the first to share your experience!
          </Alert>
        ) : (
          <Row className="g-4">
            {testimonials.map((testimonial) => (
              <Col key={testimonial.id} lg={6} className="mb-3">
                <Card className="h-100 testimonial-card shadow-sm">
                  <Card.Body>
                    {/* Rating Stars */}
                    <div className="mb-3">
                      <div className="star-rating-review">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>

                    {/* Comment */}
                    <Card.Text className="testimonial-comment mb-3">
                      "{testimonial.comment}"
                    </Card.Text>

                    {/* User Info */}
                    <div className="testimonial-meta d-flex justify-content-between align-items-center">
                      <div>
                        <strong className="d-block text-dark">{testimonial.userName}</strong>
                        <small className="text-muted">
                          {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </small>
                      </div>
                      <div className="rating-badge">
                        <span className="badge bg-primary">{testimonial.rating} / 5</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default TestimonialsList;
