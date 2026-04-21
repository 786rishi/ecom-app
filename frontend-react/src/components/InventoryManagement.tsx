import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import keycloak from '../services/keycloak';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface InventoryItem {
  id: number;
  productId: string;
  productName: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: string;
  version: number;
}

interface EditingItem {
  id: number;
  totalQuantity: number;
}

const InventoryManagement: React.FC = () => {
  const { auth } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; message: string; variant: string }>({
    show: false,
    message: '',
    variant: 'success'
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortedInventory, setSortedInventory] = useState<InventoryItem[]>([]);

  // Custom styles
  const tableRowStyle = (item: InventoryItem): React.CSSProperties => {
    return {
      backgroundColor: item.availableQuantity < 10 ? '#ffcccc' : 'inherit',
      color: item.availableQuantity < 10 ? '#dc3545' : 'inherit',
      fontWeight: item.availableQuantity < 10 ? 'bold' : 'normal'
    };
  };

  // Sort inventory by total quantity
  const sortInventory = (order: 'asc' | 'desc') => {
    const sorted = [...inventory].sort((a, b) => {
      return order === 'asc' ? a.availableQuantity - b.availableQuantity : b.availableQuantity - a.availableQuantity;
    });
    setSortedInventory(sorted);
    setSortOrder(order);
  };

  // Update sorted inventory when inventory data changes
  useEffect(() => {
    sortInventory(sortOrder);
  }, [inventory]);

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/inventory/inventory`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.keycloak?.token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInventory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  // Update inventory
  const updateInventory = async (productId: string, quantity: number) => {
    try {

      await keycloak.updateToken(30);

      const response = await fetch(
        `${API_BASE_URL}/inventory/inventory/add?productId=${productId}&quantity=${quantity}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.keycloak?.token}`
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Show success notification
      setNotification({
        show: true,
        message: 'Inventory updated successfully!',
        variant: 'success'
      });

      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);

      // Refresh inventory data
      await fetchInventory();
      setEditingItem(null);
    } catch (err) {
      setNotification({
        show: true,
        message: err instanceof Error ? err.message : 'Failed to update inventory',
        variant: 'danger'
      });

      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  // Handle edit button click
  const handleEdit = (item: InventoryItem) => {
    setEditingItem({
      id: item.id,
      totalQuantity: item.totalQuantity
    });
  };

  // Handle update button click
  const handleUpdate = (productId: string) => {
    if (editingItem) {
      updateInventory(productId, editingItem.totalQuantity);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingItem(null);
  };

  // Handle quantity change
  const handleQuantityChange = (value: string) => {
    const quantity = parseInt(value) || 0;
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        totalQuantity: quantity
      });
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Inventory Management</h2>

      {/* Notification */}
      {notification.show && (
        <Alert 
          variant={notification.variant} 
          className="mb-4"
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
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

      {/* Loading */}
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading inventory data...</p>
        </div>
      ) : (
        /* Inventory Table */
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              {/* <th>Available Quantity</th> */}
              <th>
                Total Quantity
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="ms-2"
                  onClick={() => sortInventory(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortOrder === 'asc' ? '↓' : '↑'}
                </Button>
              </th>
              <th>Updated At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  No inventory data available
                </td>
              </tr>
            ) : (
              sortedInventory.map((item) => (
                <tr key={item.id} style={tableRowStyle(item)}>
                  <td>{item.productId}</td>
                  <td>{item.productName}</td>
                  {/* <td>{item.availableQuantity}</td> */}
                  <td>
                    {editingItem?.id === item.id ? (
                      <Form.Control
                        type="number"
                        value={editingItem.totalQuantity}
                        placeholder='Enter Quantity To Add'
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        style={{ width: '80%', margin: '0 auto' }}
                      />
                    ) : (
                      item.availableQuantity
                    )}
                  </td>
                {/*   <td>{item.reservedQuantity}</td> */}
                  <td>{new Date(item.updatedAt).toLocaleString()}</td>
                  <td>
                    {editingItem?.id === item.id ? (
                      <div className="d-flex gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleUpdate(item.productId)}
                        >
                          Update
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default InventoryManagement;
