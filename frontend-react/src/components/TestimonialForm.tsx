import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { Testimonial, TestimonialFormData } from '../types/testimonial';
import { testimonialService } from '../services/testimonialService';
import './TestimonialForm.css';

interface TestimonialFormProps {
  productId: string;
  userId: string;
  userName: string;
  isAuthenticated: boolean;
  onSubmitSuccess?: () => void;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({
  productId,
  userId,
  userName,
  isAuthenticated,
  onSubmitSuccess
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<Testimonial | null>(null);

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRating(parseInt(e.target.value, 10));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!comment.trim()) {
      setErrorMessage('Please write a comment before submitting.');
      return;
    }

    if (comment.trim().length < 10) {
      setErrorMessage('Comment must be at least 10 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const testimonialData: TestimonialFormData = {
      productId,
      userId,
      userName,
      comment: comment.trim(),
      rating,
      approved: true,
      createdAt: new Date().toISOString()
    };

    const response = await testimonialService.createTestimonial(testimonialData);

    if (response.success && response.data) {
      setSuccessMessage('Thank you! Your testimonial has been submitted successfully.');
      setComment('');
      setRating(5);
      setSubmittedData(response.data);
      
      // Call the success callback after 2 seconds
      setTimeout(() => {
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      }, 2000);
    } else {
      setErrorMessage(response.error || 'Failed to submit testimonial. Please try again.');
    }

    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="testimonial-form-section py-5 bg-white">
        <Container>
          <Card className="border-warning">
            <Card.Body>
              <Card.Title className="mb-3">Share Your Experience</Card.Title>
              <Alert variant="info">
                Please <strong>login</strong> to submit a testimonial for this product.
              </Alert>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="testimonial-form-section py-5 bg-white">
      <Container>
        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white">
            <Card.Title className="mb-0">Share Your Feedback</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="mb-4">
              <small className="text-muted">Sharing as: <strong>{userName}</strong></small>
            </div>

            {successMessage && (
              <Alert 
                variant="success" 
                onClose={() => setSuccessMessage(null)}
                dismissible
              >
                {successMessage}
              </Alert>
            )}

            {errorMessage && (
              <Alert 
                variant="danger"
                onClose={() => setErrorMessage(null)}
                dismissible
              >
                {errorMessage}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Rating Selection */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  Rate this product <span className="text-danger">*</span>
                </Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Form.Select
                    value={rating}
                    onChange={handleRatingChange}
                    disabled={loading}
                    className="rating-select"
                    style={{ maxWidth: '150px' }}
                  >
                    <option value={1}>1 - Poor</option>
                    <option value={2}>2 - Fair</option>
                    <option value={3}>3 - Good</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={5}>5 - Excellent</option>
                  </Form.Select>
                  <div className="star-display">
                    {'★'.repeat(rating)}
                    {'☆'.repeat(5 - rating)}
                  </div>
                </div>
              </Form.Group>

              {/* Comment Field */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  Your Comment <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Share your experience with this product. Tell us what you liked or disliked..."
                  value={comment}
                  onChange={handleCommentChange}
                  disabled={loading}
                  className="comment-textarea"
                />
                <Form.Text className="text-muted">
                  {comment.length}/500 characters
                </Form.Text>
              </Form.Group>

              {/* Submit Button */}
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={loading || !comment.trim()}
                  className="submit-button"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Submitting...
                    </>
                  ) : (
                    'Submit Testimonial'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default TestimonialForm;
