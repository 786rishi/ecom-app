import { CartItem } from '../contexts/CartContext';

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  price: number;
}

export interface PromotionItem {
  id: number;
  productId: string;
  quantity: number;
  price: number;
}

export interface PromotionRequest {
  id: number;
  userId: string;
  totalAmount: number;
  couponCode: string;
  items: PromotionItem[];
}

export interface CheckoutRequest {
  userId: string;
}

export interface PaymentRequest {
  userId: string;
}

export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
  };
}

export interface GetCartResponse {
  success: boolean;
  message: string;
  items: CartItemResponse[];
  total: number;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  orderId?: string;
  totalAmount?: number;
  discountedAmount?: number;
  originalAmount?: number;
  discount?: number;
  finalAmount?: number;
  appliedPromotions?: string[];
  createdAt?: string;
  id?: number;
  paymentId?: string | null;
  status?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class OrderService {
  private getAuthHeaders() {
    const token = localStorage.getItem('keycloak_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async addToCart(userId: string, productId: string, quantity: number, price: number): Promise<OrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/order/cart/add?userId=${encodeURIComponent(userId)}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          productId,
          quantity,
          price
        } as AddToCartRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Product added to cart successfully',
        ...data
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add product to cart'
      };
    }
  }

  async applyPromotion(userId: string, totalAmount: number, items: CartItem[], couponCode: string): Promise<OrderResponse> {
    try {
      const promotionItems: PromotionItem[] = items.map((item, index) => ({
        id: index + 1,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const response = await fetch(`${API_BASE_URL}/promotions/promotions/apply`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          id: 2,
          userId,
          totalAmount,
          couponCode,
          items: promotionItems
        } as PromotionRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Promotion applied successfully',
        originalAmount: data.originalAmount || totalAmount,
        discount: data.discount || 0,
        finalAmount: data.finalAmount || totalAmount,
        appliedPromotions: data.appliedPromotions || [],
        ...data
      };
    } catch (error) {
      console.error('Error applying promotion:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to apply promotion'
      };
    }
  }

  async checkout(userId: string): Promise<OrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/order/orders/checkout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          userId
        } as CheckoutRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Checkout completed successfully',
        orderId: data.orderId,
        ...data
      };
    } catch (error) {
      console.error('Error during checkout:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to complete checkout'
      };
    }
  }

  async makePayment(orderId: string, userId: string): Promise<OrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/order/orders/${orderId}/pay`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          userId
        } as PaymentRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Payment completed successfully',
        ...data
      };
    } catch (error) {
      console.error('Error during payment:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process payment'
      };
    }
  }

  async getCart(userId: string): Promise<GetCartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/order/cart/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Cart retrieved successfully',
        items: data.items || [],
        total: data.total || 0,
        ...data
      };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch cart',
        items: [],
        total: 0
      };
    }
  }

  async clearCart(userId: string): Promise<OrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/order/cart/clear?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        // Response is empty, which is expected for DELETE operations
      }
      return {
        success: true,
        message: 'Cart cleared successfully',
        ...data
      };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to clear cart'
      };
    }
  }

  async confirmInventory(productId: string, quantity: number): Promise<OrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/inventory/confirm?productId=${encodeURIComponent(productId)}&quantity=${quantity}`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: 'Inventory confirmed successfully',
        ...data
      };
    } catch (error) {
      console.error('Error confirming inventory:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to confirm inventory'
      };
    }
  }
}

export const orderService = new OrderService();
