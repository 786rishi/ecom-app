import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Form, Badge, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import keycloak from '../services/keycloak';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface Promotion {
  id: string;
  name: string;
  type: 'PERCENTAGE' | 'FLAT';
  discountValue: number | null;
  minOrderAmount: number | null;
  couponCode: string | null;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  conditions: {
    buy?: number;
    get?: number;
  } | null;
}

interface EditingPromotion {
  [key: string]: Partial<Promotion>;
}

const Promotions: React.FC = () => {
  const { auth } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<EditingPromotion>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromotion, setNewPromotion] = useState<Partial<Promotion>>({
    name: '',
    type: 'PERCENTAGE',
    discountValue: null,
    minOrderAmount: null,
    couponCode: null,
    active: true,
    startDate: null,
    endDate: null,
    conditions: null
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user?.roles?.includes('admin')) {
      window.location.hash = '';
      window.location.hash = 'browse';
    }
  }, [auth]);

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/promotions/admin/promotions`, {
        headers: {
          'Authorization': `Bearer ${auth.keycloak?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch promotions: ${response.statusText}`);
      }

      const data = await response.json();
      setPromotions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.roles?.includes('admin')) {
      fetchPromotions();
    }
  }, [auth]);

  // Handle edit button click
  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion({
      [promotion.id]: { ...promotion }
    });
  };

  // Handle input change during editing
  const handleInputChange = (promotionId: string, field: keyof Promotion, value: any) => {
    setEditingPromotion(prev => ({
      ...prev,
      [promotionId]: {
        ...prev[promotionId],
        [field]: value
      }
    }));
  };

  // Handle update button click
  const handleUpdate = async (promotionId: string) => {
    try {
      const updatedPromotion = editingPromotion[promotionId];
      if (!updatedPromotion) return;

      await keycloak.updateToken(30);

      const response = await fetch(`${API_BASE_URL}/promotions/admin/promotions/${promotionId}/status?active=${updatedPromotion.active}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${auth.keycloak?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPromotion)
      });

      if (!response.ok) {
        throw new Error(`Failed to update promotion: ${response.statusText}`);
      }

      // Clear editing state
      setEditingPromotion(prev => {
        const newState = { ...prev };
        delete newState[promotionId];
        return newState;
      });

      // Show success notification
      setNotification({
        type: 'success',
        message: 'Promotion updated successfully!'
      });

      // Refresh promotions list
      await fetchPromotions();

      // Hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update promotion'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle cancel edit
  const handleCancel = (promotionId: string) => {
    setEditingPromotion(prev => {
      const newState = { ...prev };
      delete newState[promotionId];
      return newState;
    });
  };

  // Handle Add Promotion
  const handleAddPromotion = () => {
    setShowAddModal(true);
  };

  // Handle form input change for new promotion
  const handleNewPromotionChange = (field: keyof Promotion, value: any) => {
    setNewPromotion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save new promotion
  const handleSaveNewPromotion = async () => {
    try {
      // Validate required fields
      if (!newPromotion.name || !newPromotion.type) {
        setNotification({
          type: 'error',
          message: 'Name and Type are required fields'
        });
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      // Prepare promotion data based on type
      const promotionData: any = {
        name: newPromotion.name,
        type: newPromotion.type,
        active: newPromotion.active
      };

      // Add type-specific fields
      if (newPromotion.type === 'PERCENTAGE' || newPromotion.type === 'FLAT') {
        if (newPromotion.discountValue !== null) {
          promotionData.discountValue = newPromotion.discountValue;
        }
        if (newPromotion.minOrderAmount !== null) {
          promotionData.minOrderAmount = newPromotion.minOrderAmount;
        }
        if (newPromotion.type === 'FLAT' && newPromotion.couponCode) {
          promotionData.couponCode = newPromotion.couponCode;
        }
      } else if (newPromotion.type === 'BOGO') {
        // Always include conditions for BOGO, even if empty
        promotionData.conditions = newPromotion.conditions || { buy: 0, get: 0 };
      }

      await keycloak.updateToken(30);

      const response = await fetch(`${API_BASE_URL}/promotions/admin/promotions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.keycloak?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promotionData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create promotion: ${response.statusText}`);
      }

      // Reset form and close modal
      setNewPromotion({
        name: '',
        type: 'PERCENTAGE',
        discountValue: null,
        minOrderAmount: null,
        couponCode: null,
        active: true,
        startDate: null,
        endDate: null,
        conditions: null
      });
      setShowAddModal(false);

      // Show success notification
      setNotification({
        type: 'success',
        message: 'Promotion created successfully!'
      });

      // Refresh promotions list
      await fetchPromotions();

      // Hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create promotion'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    // Reset form
    setNewPromotion({
      name: '',
      type: 'PERCENTAGE',
      discountValue: null,
      minOrderAmount: null,
      couponCode: null,
      active: true,
      startDate: null,
      endDate: null,
      conditions: null
    });
  };

  // Format promotion type for display
  const formatPromotionType = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return <Badge bg="info">Percentage</Badge>;
      case 'FLAT':
        return <Badge bg="success">Flat</Badge>;
      case 'BOGO':
        return <Badge bg="warning">BOGO</Badge>;
      default:
        return type;
    }
  };

  // Format discount value based on type
  const formatDiscountValue = (promotion: Promotion) => {
    if (promotion.type === 'PERCENTAGE' && promotion.discountValue) {
      return `${promotion.discountValue}%`;
    } else if (promotion.type === 'FLAT' && promotion.discountValue) {
      return `$${promotion.discountValue}`;
    } 
    return '-';
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading promotions...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Promotions Management</h2>
        <Button variant="primary" onClick={handleAddPromotion}>
          Add Promotion
        </Button>
      </div>

      {/* Notification */}
      {notification && (
        <Alert 
          variant={notification.type === 'success' ? 'success' : 'danger'} 
          className="mb-4"
          onClose={() => setNotification(null)}
          dismissible
        >
          {notification.message}
        </Alert>
      )}

      {/* Error */}
      {error && (
        <Alert variant="danger" className="mb-4">
          Error: {error}
        </Alert>
      )}

      {/* Promotions Table */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Discount Value</th>
              <th>Min Order Amount</th>
              <th>Coupon Code</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promotion) => {
              const isEditing = editingPromotion[promotion.id];
              
              return (
                <tr key={promotion.id}>
                  <td>
                    {isEditing ? (
                      <Form.Control
                        type="text"
                        value={isEditing.name || ''}
                        onChange={(e) => handleInputChange(promotion.id, 'name', e.target.value)}
                        size="sm"
                      />
                    ) : (
                      promotion.name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <Form.Select
                        value={isEditing.type || ''}
                        onChange={(e) => handleInputChange(promotion.id, 'type', e.target.value)}
                        size="sm"
                      >
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="FLAT">Flat</option>
                        <option value="BOGO">BOGO</option>
                      </Form.Select>
                    ) : (
                      formatPromotionType(promotion.type)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <Form.Control
                        type="number"
                        value={isEditing.discountValue || ''}
                        onChange={(e) => handleInputChange(promotion.id, 'discountValue', e.target.value ? parseFloat(e.target.value) : null)}
                        size="sm"
                      />
                    ) : (
                      formatDiscountValue(promotion)
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <Form.Control
                        type="number"
                        value={isEditing.minOrderAmount || ''}
                        onChange={(e) => handleInputChange(promotion.id, 'minOrderAmount', e.target.value ? parseFloat(e.target.value) : null)}
                        size="sm"
                      />
                    ) : (
                      promotion.minOrderAmount ? `$${promotion.minOrderAmount}` : '-'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <Form.Control
                        type="text"
                        value={isEditing.couponCode || ''}
                        onChange={(e) => handleInputChange(promotion.id, 'couponCode', e.target.value || null)}
                        size="sm"
                      />
                    ) : (
                      promotion.couponCode || '-'
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <Form.Check
                        type="checkbox"
                        checked={isEditing.active || false}
                        onChange={(e) => handleInputChange(promotion.id, 'active', e.target.checked)}
                      />
                    ) : (
                      <Badge bg={promotion.active ? 'success' : 'secondary'}>
                        {promotion.active ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="d-flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleUpdate(promotion.id)}
                        >
                          Update
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancel(promotion.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEdit(promotion)}
                      >
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {promotions.length === 0 && !loading && !error && (
        <Alert variant="info">
          No promotions found.
        </Alert>
      )}

      {/* Add Promotion Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Promotion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Promotion Name *</Form.Label>
              <Form.Control
                type="text"
                value={newPromotion.name || ''}
                onChange={(e) => handleNewPromotionChange('name', e.target.value)}
                placeholder="Enter promotion name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Promotion Type *</Form.Label>
              <Form.Select
                value={newPromotion.type || 'PERCENTAGE'}
                onChange={(e) => handleNewPromotionChange('type', e.target.value)}
              >
                <option value="PERCENTAGE">Percentage Discount</option>
                <option value="FLAT">Flat Discount (Coupon-based)</option>
              </Form.Select>
            </Form.Group>

            {newPromotion.type === 'PERCENTAGE' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Discount Value (%)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newPromotion.discountValue || ''}
                    onChange={(e) => handleNewPromotionChange('discountValue', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Enter percentage (e.g., 10 for 10%)"
                    min="0"
                    max="100"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Minimum Order Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={newPromotion.minOrderAmount || ''}
                    onChange={(e) => handleNewPromotionChange('minOrderAmount', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Enter minimum order amount"
                    min="0"
                  />
                </Form.Group>
              </>
            )}

            {newPromotion.type === 'FLAT' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Discount Value ($)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newPromotion.discountValue || ''}
                    onChange={(e) => handleNewPromotionChange('discountValue', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Enter flat discount amount"
                    min="0"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Coupon Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={newPromotion.couponCode || ''}
                    onChange={(e) => handleNewPromotionChange('couponCode', e.target.value)}
                    placeholder="Enter coupon code (e.g., WELCOME200)"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Minimum Order Amount</Form.Label>
                  <Form.Control
                    type="number"
                    value={newPromotion.minOrderAmount || ''}
                    onChange={(e) => handleNewPromotionChange('minOrderAmount', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Enter minimum order amount"
                    min="0"
                  />
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={newPromotion.active || false}
                onChange={(e) => handleNewPromotionChange('active', e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveNewPromotion}>
            Save Promotion
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Promotions;
