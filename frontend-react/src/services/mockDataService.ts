import { Product } from '../types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.',
    price: 199.99,
    category: 'Electronics',
    brand: 'AudioTech',
    image: 'https://picsum.photos/seed/headphones1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'Black', type: 'color' },
      { name: 'size', value: 'Standard', type: 'size' },
      { name: 'material', value: 'Plastic', type: 'material' }
    ],
    inStock: true,
    rating: 4.5,
    reviews: 234,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking smartwatch with heart rate monitor, GPS, and smartphone integration.',
    price: 299.99,
    category: 'Electronics',
    brand: 'TechWatch',
    image: 'https://picsum.photos/seed/smartwatch1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'Silver', type: 'color' },
      { name: 'size', value: '42mm', type: 'size' },
      { name: 'material', value: 'Aluminum', type: 'material' }
    ],
    inStock: true,
    rating: 4.3,
    reviews: 156,
    createdAt: '2024-01-10T15:30:00Z',
    updatedAt: '2024-01-10T15:30:00Z'
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable organic cotton t-shirt perfect for everyday wear.',
    price: 29.99,
    category: 'Clothing',
    brand: 'EcoWear',
    image: 'https://picsum.photos/seed/tshirt1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'White', type: 'color' },
      { name: 'size', value: 'Large', type: 'size' },
      { name: 'material', value: 'Cotton', type: 'material' }
    ],
    inStock: true,
    rating: 4.1,
    reviews: 89,
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z'
  },
  {
    id: '4',
    name: 'Running Shoes',
    description: 'Lightweight and breathable running shoes with advanced cushioning technology.',
    price: 89.99,
    category: 'Footwear',
    brand: 'SpeedRun',
    image: 'https://picsum.photos/seed/shoes1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'Blue', type: 'color' },
      { name: 'size', value: '10', type: 'size' },
      { name: 'material', value: 'Mesh', type: 'material' }
    ],
    inStock: true,
    rating: 4.6,
    reviews: 312,
    createdAt: '2024-01-18T14:20:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: '5',
    name: 'Laptop Backpack',
    description: 'Durable and spacious backpack with laptop compartment and multiple pockets.',
    price: 49.99,
    category: 'Accessories',
    brand: 'TravelGear',
    image: 'https://picsum.photos/seed/backpack1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'Gray', type: 'color' },
      { name: 'size', value: 'Medium', type: 'size' },
      { name: 'material', value: 'Nylon', type: 'material' }
    ],
    inStock: false,
    rating: 4.2,
    reviews: 67,
    createdAt: '2024-01-22T11:45:00Z',
    updatedAt: '2024-01-22T11:45:00Z'
  },
  {
    id: '6',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking and long battery life.',
    price: 34.99,
    category: 'Electronics',
    brand: 'OfficeTech',
    image: 'https://picsum.photos/seed/mouse1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'Black', type: 'color' },
      { name: 'size', value: 'Standard', type: 'size' },
      { name: 'material', value: 'Plastic', type: 'material' }
    ],
    inStock: true,
    rating: 4.0,
    reviews: 145,
    createdAt: '2024-01-25T16:30:00Z',
    updatedAt: '2024-01-25T16:30:00Z'
  },
  {
    id: '7',
    name: 'Yoga Mat',
    description: 'Non-slip exercise yoga mat with extra cushioning for comfort during workouts.',
    price: 24.99,
    category: 'Sports',
    brand: 'FitLife',
    image: 'https://picsum.photos/seed/yogamat1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'Purple', type: 'color' },
      { name: 'size', value: 'Standard', type: 'size' },
      { name: 'material', value: 'Rubber', type: 'material' }
    ],
    inStock: true,
    rating: 4.4,
    reviews: 98,
    createdAt: '2024-01-28T13:10:00Z',
    updatedAt: '2024-01-28T13:10:00Z'
  },
  {
    id: '8',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe and multiple brewing options.',
    price: 79.99,
    category: 'Home',
    brand: 'BrewMaster',
    image: 'https://picsum.photos/seed/coffee1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'Stainless Steel', type: 'color' },
      { name: 'size', value: '12 Cup', type: 'size' },
      { name: 'material', value: 'Stainless Steel', type: 'material' }
    ],
    inStock: true,
    rating: 4.3,
    reviews: 201,
    createdAt: '2024-02-01T10:25:00Z',
    updatedAt: '2024-02-01T10:25:00Z'
  },
  {
    id: '9',
    name: 'Denim Jeans',
    description: 'Classic fit denim jeans with comfortable stretch fabric and modern styling.',
    price: 59.99,
    category: 'Clothing',
    brand: 'DenimCo',
    image: 'https://picsum.photos/seed/jeans1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'Blue', type: 'color' },
      { name: 'size', value: '32x32', type: 'size' },
      { name: 'material', value: 'Denim', type: 'material' }
    ],
    inStock: true,
    rating: 4.2,
    reviews: 178,
    createdAt: '2024-02-03T15:40:00Z',
    updatedAt: '2024-02-03T15:40:00Z'
  },
  {
    id: '10',
    name: 'Tablet Stand',
    description: 'Adjustable aluminum tablet stand for comfortable viewing angles.',
    price: 19.99,
    category: 'Accessories',
    brand: 'StandPro',
    image: 'https://picsum.photos/seed/stand1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'Silver', type: 'color' },
      { name: 'size', value: 'Universal', type: 'size' },
      { name: 'material', value: 'Aluminum', type: 'material' }
    ],
    inStock: true,
    rating: 4.1,
    reviews: 56,
    createdAt: '2024-02-05T12:15:00Z',
    updatedAt: '2024-02-05T12:15:00Z'
  },
  {
    id: '11',
    name: 'Water Bottle',
    description: 'Insulated stainless steel water bottle that keeps drinks cold for 24 hours.',
    price: 14.99,
    category: 'Sports',
    brand: 'HydroLife',
    image: 'https://picsum.photos/seed/bottle1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'Blue', type: 'color' },
      { name: 'size', value: '32oz', type: 'size' },
      { name: 'material', value: 'Stainless Steel', type: 'material' }
    ],
    inStock: true,
    rating: 4.5,
    reviews: 234,
    createdAt: '2024-02-07T09:30:00Z',
    updatedAt: '2024-02-07T09:30:00Z'
  },
  {
    id: '12',
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness and color temperature.',
    price: 39.99,
    category: 'Home',
    brand: 'BrightLight',
    image: 'https://picsum.photos/seed/lamp1/400/300.jpg',
    attributes: [
      { name: 'color', value: 'White', type: 'color' },
      { name: 'size', value: 'Standard', type: 'size' },
      { name: 'material', value: 'Plastic', type: 'material' }
    ],
    inStock: true,
    rating: 4.0,
    reviews: 89,
    createdAt: '2024-02-09T14:20:00Z',
    updatedAt: '2024-02-09T14:20:00Z'
  }
];

export const getCategories = (): string[] => {
  const categories = Array.from(new Set(mockProducts.map(product => product.category)));
  return categories.sort();
};

export const getBrands = (): string[] => {
  const brands = Array.from(new Set(mockProducts.map(product => product.brand)));
  return brands.sort();
};

export const getPriceRange = (): { min: number; max: number } => {
  const prices = mockProducts.map(product => product.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};
