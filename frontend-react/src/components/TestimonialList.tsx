import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { Testimonial } from '../types/testimonial';

interface TestimonialListProps {
  testimonials: Testimonial[];
  averageRating: number;
}

const TestimonialList: React.FC<TestimonialListProps> = ({ testimonials, averageRating }) => {
  const renderStars = (rating: number) => {
    return (
      <div className="text-warning">
        {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (testimonials.length === 0) {
    return (
      <Card className="mt-4">
        <Card.Body>
          <Card.Title as="h4">Customer Reviews</Card.Title>
          <div className="text-center text-muted py-4">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <Card.Body>
        <Card.Title as="h4" className="mb-4">Customer Reviews</Card.Title>
        
        {/* Average Rating Summary */}
        <div className="rating-summary mb-4 p-3 bg-light rounded">
          <Row className="align-items-center">
            <Col md={4} className="text-center">
              <div className="display-4 fw-bold text-primary">{averageRating}</div>
              <div className="text-warning mb-2">
                {renderStars(averageRating)}
              </div>
              <Badge bg="secondary">{testimonials.length} Reviews</Badge>
            </Col>
            <Col md={8}>
              <h6>Rating Distribution</h6>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = testimonials.filter(t => t.rating === rating).length;
                const percentage = testimonials.length > 0 ? (count / testimonials.length) * 100 : 0;
                return (
                  <div key={rating} className="d-flex align-items-center mb-1">
                    <span className="me-2" style={{ minWidth: '50px' }}>
                      {rating} ★
                    </span>
                    <div className="progress flex-grow-1" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-warning"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="ms-2 text-muted small" style={{ minWidth: '30px' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </Col>
          </Row>
        </div>

        {/* Individual Testimonials */}
        <div className="testimonials-list">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="mb-3 border">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1">{testimonial.userName}</h6>
                    <div className="text-warning small">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <small className="text-muted">
                    {formatDate(testimonial.createdAt)}
                  </small>
                </div>
                <p className="mb-0 text-muted">{testimonial.comment}</p>
              </Card.Body>
            </Card>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TestimonialList;
