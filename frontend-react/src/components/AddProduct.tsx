import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, Alert, Row, Col, Card, Dropdown, InputGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import keycloak from '../services/keycloak';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  active: boolean;
  featured: boolean;
  featureStart: string;
  featureEnd: string;
  availableQuantity: string;
  inStock: boolean;
  attributes: { [key: string]: string };
  image: string;
}

// Fixed categories list
const CATEGORIES = [
  'Women Kurtas & Suits',
  'Women Kurtis & Tunics',
  'Women Leggings, Salwars & Churidars',
  'Women Skirts & Palazzos',
  'Women Sarees & Blouses',
  'Women Dress Material',
  'Women Lehenga Choli',
  'Women Dupattas & Shawls',
  'Women Dresses & Jumpsuits',
  'Women Tops, T-Shirts & Shirts',
  'Women Jeans & Jeggings',
  'Women Trousers & Capris',
  'Women Shorts & Skirts',
  'Women Shrugs',
  'Women Sweaters & Sweatshirts',
  'Women Jackets & Waistcoats',
  'Women Coats & Blazers',
  'Women Women Watches',
  'Women Analog',
  'Women Chronograph',
  'Women Digital',
  'Women Analog & Digital',
  'Women Sunglasses',
  'Women Eye Glasses',
  'Women Belt',
  'Men T-Shirts',
  'Men Casual Shirts',
  'Men Formal Shirts',
  'Men Suits',
  'Men Jeans',
  'Men Casual Trousers',
  'Men Formal Trousers',
  'Men Shorts',
  'Men Track Pants',
  'Men Sweaters & Sweatshirts',
  'Men Jackets',
  'Men Blazers & Coats',
  'Men Sports & Active Wear',
  'Men Indian & Festive Wear',
  'Men Innerwear & Sleepwear',
  'Men Watches & Wearables',
  'Men Sunglasses & Frames',
  'Men Bags & Backpacks',
  'Men Luggage & Trolleys',
  'Men Personal Care & Grooming',
  'Men Wallets & Belts',
  'Men Fashion Accessories'
];

const SearchableDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'Select category' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCategories = CATEGORIES.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (category: string) => {
    onChange(category);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className="position-relative">
      <InputGroup>
        <Form.Control
          type="text"
          value={isOpen ? searchTerm : value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoComplete="off"
        />
        <Button
          variant="outline-secondary"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm('');
          }}
        >
          {isOpen ? '▲' : '▼'}
        </Button>
      </InputGroup>
      
      {isOpen && (
        <div className="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-lg z-1000" style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => (
              <div
                key={index}
                className="px-3 py-2 cursor-pointer hover-bg-light"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSelect(category)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {category}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-muted">
              No categories found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AddProduct: React.FC = () => {
  const { auth } = useAuth();
  
  // Initialize all hooks before any early returns
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    active: true,
    featured: false,
    featureStart: '',
    featureEnd: '',
    availableQuantity: '0',
    inStock: true,
    attributes: {},
    image: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Check if user is admin
  if (!auth.isAuthenticated || !auth.user?.roles?.includes('admin')) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>You need admin privileges to access this page.</p>
        </Alert>
      </Container>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAttributeChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value
      }
    }));
  };

  const handleImageChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      image: value
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowError(false);
    setShowSuccess(false);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        active: formData.active,
        featured: formData.featured,
        featureStart: formData.featureStart ? new Date(formData.featureStart).toISOString() : null,
        featureEnd: formData.featureEnd ? new Date(formData.featureEnd).toISOString() : null,
        availableQuantity: parseInt(formData.availableQuantity),
        inStock: formData.inStock,
        attributes: formData.attributes,
        image: formData.image
      };

      await keycloak.updateToken(30);

      const response = await fetch(`${API_BASE_URL}/products/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.keycloak?.token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowSuccess(true);
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        active: true,
        featured: false,
        featureStart: '',
        featureEnd: '',
        availableQuantity: '0',
        inStock: true,
        attributes: {},
        image: ''
      });

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error('Error creating product:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create product');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Add New Product</h2>

      {showSuccess && (
        <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
          <Alert.Heading>Success!</Alert.Heading>
          <p>Product added successfully!</p>
        </Alert>
      )}

      {showError && (
        <Alert variant="danger" dismissible onClose={() => setShowError(false)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{errorMessage}</p>
        </Alert>
      )}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <SearchableDropdown
                    value={formData.category}
                    onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    placeholder="Select category"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Available Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="availableQuantity"
                    value={formData.availableQuantity}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={3}>
                <Form.Check
                  type="checkbox"
                  name="active"
                  label="Active"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={3}>
                <Form.Check
                  type="checkbox"
                  name="inStock"
                  label="In Stock"
                  checked={formData.inStock}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={3}>
                <Form.Check
                  type="checkbox"
                  name="featured"
                  label="Featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            {formData.featured && (
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Feature Start</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="featureStart"
                      value={formData.featureStart}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Feature End</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="featureEnd"
                      value={formData.featureEnd}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Attributes (flexible key-value pairs)</Form.Label>
              <Row>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Attribute name (e.g., color)"
                    value={Object.keys(formData.attributes)[0] || ''}
                    onChange={(e) => {
                      const oldKey = Object.keys(formData.attributes)[0];
                      const oldValue = formData.attributes[oldKey] || '';
                      const newAttributes = { ...formData.attributes };
                      if (oldKey) delete newAttributes[oldKey];
                      if (e.target.value) {
                        newAttributes[e.target.value] = oldValue;
                      }
                      setFormData(prev => ({ ...prev, attributes: newAttributes }));
                    }}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Attribute value (e.g., red)"
                    value={Object.values(formData.attributes)[0] || ''}
                    onChange={(e) => {
                      const key = Object.keys(formData.attributes)[0];
                      if (key) {
                        handleAttributeChange(key, e.target.value);
                      }
                    }}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Image</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => handleImageChange(e.target.value)}
              />
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="mt-3"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddProduct;
