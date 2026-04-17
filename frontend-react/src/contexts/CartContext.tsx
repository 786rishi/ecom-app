import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product } from '../types/product';
import { orderService } from '../services/orderService';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: { items: any[]; total: number; itemCount: number } };

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.product.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          total: state.total + action.payload.price,
          itemCount: state.itemCount + 1
        };
      } else {
        return {
          ...state,
          items: [...state.items, { product: action.payload, quantity: 1 }],
          total: state.total + action.payload.price,
          itemCount: state.itemCount + 1
        };
      }
    }
    
    case 'REMOVE_FROM_CART': {
      const itemToRemove = state.items.find(item => item.product.id === action.payload);
      if (!itemToRemove) return state;
      
      const updatedItems = state.items.filter(item => item.product.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        total: state.total - (itemToRemove.product.price * itemToRemove.quantity),
        itemCount: state.itemCount - itemToRemove.quantity
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: productId });
      }
      
      const existingItem = state.items.find(item => item.product.id === productId);
      if (!existingItem) return state;
      
      const quantityDiff = quantity - existingItem.quantity;
      const updatedItems = state.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity, product: { ...item.product, images: undefined } }
          : item
      );
      
      return {
        ...state,
        items: updatedItems,
        total: state.total + (existingItem.product.price * quantityDiff),
        itemCount: state.itemCount + quantityDiff
      };
    }
    
    case 'CLEAR_CART':
      return initialState;
    
    case 'LOAD_CART': {
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        itemCount: action.payload.itemCount
      };
    }
    
    default:
      return state;
  }
};

interface CartContextType {
  cart: CartState;
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  const { auth } = useAuth();

  const addToCart = async (product: Product) => {
    // First update local state
    dispatch({ type: 'ADD_TO_CART', payload: product });
    
    // Then make API call if user is authenticated
    if (auth.isAuthenticated && auth.user?.id) {
      try {
        const result = await orderService.addToCart(
          auth.user.id,
          product.id,
          1,
          product.price
        );
        
        if (!result.success) {
          console.error('Failed to add to cart on backend:', result.message);
          // Optionally revert local state if API call fails
          // dispatch({ type: 'REMOVE_FROM_CART', payload: product.id });
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        // Optionally revert local state if API call fails
        // dispatch({ type: 'REMOVE_FROM_CART', payload: product.id });
      }
    }
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = async () => {
    // First make API call if user is authenticated
    if (auth.isAuthenticated && auth.user?.id) {
      try {
        const result = await orderService.clearCart(auth.user.id);
        
        if (result.success) {
          // Show success message
          alert('Cart is cleared');
        } else {
          console.error('Failed to clear cart on backend:', result.message);
          alert('Failed to clear cart: ' + result.message);
          return;
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
        alert('Error clearing cart');
        return;
      }
    }
    
    // Then clear local state
    dispatch({ type: 'CLEAR_CART' });
  };

  const loadCart = async () => {
    if (!auth.isAuthenticated || !auth.user?.id) {
      return;
    }

    try {
      const result = await orderService.getCart(auth.user.id);
      
      if (result?.success && result?.items?.length > 0) {
        // Convert API response to CartItem format
        const cartItems = result.items.map((item: any) => ({
          product: {
            id: item.productId,
            name: item.product?.name || 'Unknown Product',
            description: item.product?.description || '',
            price: item.price,
            category: item.product?.category || 'Unknown',
            brand: item.product?.brand || 'Unknown',
            image: item.product?.image || '/placeholder-image.jpg',
            attributes: item.product?.attributes || [],
            inStock: item.product?.inStock ?? true,
            rating: item.product?.rating,
            reviews: item.product?.reviews,
            createdAt: item.product?.createdAt || new Date().toISOString(),
            updatedAt: item.product?.updatedAt || new Date().toISOString(),
            active: item.product?.active,
            featured: item.product?.featured,
            featureStart: item.product?.featureStart,
            featureEnd: item.product?.featureEnd,
            availableQuantity: item.product?.availableQuantity
          },
          quantity: item.quantity
        }));

        const itemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const total = cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);

        dispatch({
          type: 'LOAD_CART',
          payload: {
            items: cartItems as CartItem[],
            total,
            itemCount
          }
        });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  // Load cart when user authenticates
  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.id) {
      loadCart();
    }
  }, [auth.isAuthenticated, auth.user?.id]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
