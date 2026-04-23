import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import './NewsAndEvents.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  body: string;
  author: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  metaTitle: string;
  metaDescription: string;
  imageUrl: string;
}

const NewsAndEvents: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNewsItems();
  }, []);

  const fetchNewsItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/content/content/published`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: NewsItem[] = await response.json();
      
      // Sort by createdAt in descending order (newest first)
      const sortedData = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNewsItems(sortedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news items');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="news-events-loading">
        <Container className="py-5">
          <div className="text-center">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading latest news and events...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-events-error">
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>Error Loading News & Events</Alert.Heading>
            <p>{error}</p>
            <p>Please try again later or contact support if the problem persists.</p>
          </Alert>
        </Container>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="news-events-empty">
        <Container className="py-5">
          <div className="text-center">
            <h3>No News & Events Available</h3>
            <p>Check back later for the latest updates from MCart.</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="news-events-page">
      <Container className="py-5">
        <div className="news-events-header text-center mb-5">
          <h1 className="display-4 fw-bold text-primary mb-3">News & Events</h1>
          <p className="lead text-muted">
            Stay updated with the latest trends, promotions, and announcements from MCart
          </p>
        </div>

        <Row className="g-4">
          {newsItems.map((item) => (
            <Col key={item.id} md={6} lg={4} className="mb-4">
              <Card className="news-card h-100 shadow-sm hover-lift">
                <div className="news-image-container">
                  <Card.Img
                    variant="top"
                    src={item.imageUrl}
                    alt={item.title}
                    className="news-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://source.unsplash.com/800x600/?shopping,fashion';
                    }}
                  />
                  <div className="news-type-badge">
                    <Badge bg="primary">{item.type}</Badge>
                  </div>
                </div>
                
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="news-title fw-bold">
                    {item.title}
                  </Card.Title>
                  
                  <Card.Text className="news-meta text-muted small mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>By {item.author}</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </Card.Text>
                  
                  <Card.Text className="news-excerpt flex-grow-1">
                    {truncateText(item.body, 150)}
                  </Card.Text>
                  
                  <div className="news-footer mt-auto">
                    <small className="text-muted">
                      {formatDate(item.updatedAt) !== formatDate(item.createdAt) && 
                        `Updated ${formatDate(item.updatedAt)}`
                      }
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default NewsAndEvents;
