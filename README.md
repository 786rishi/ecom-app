# Mcart - E-Commerce Application

A modern, scalable e-commerce platform built with microservices architecture. Mcart provides a complete online shopping experience with user management, product catalog, order processing, inventory management, and promotional features.

## Architecture Overview

### Backend (Microservices)
- **Technology Stack**: Spring Boot 3.2.5, Java 17
- **Architecture**: Microservices with API Gateway
- **Services**:
  - **Gateway Service** (Port 8090) - API Gateway and routing
  - **User Service** (Port 8080) - User authentication and management
  - **Order Service** (Port 8082) - Order processing and cart management
  - **Content Service** (Port 8083) - Content management
  - **Product Catalog Service** (Port 8084) - Product information and categories
  - **Inventory Service** (Port 8085) - Stock management
  - **Promotion Service** (Port 8086) - Discounts and promotional campaigns

### Frontend
- **Technology Stack**: React 19.2.4, TypeScript, Bootstrap 5
- **Authentication**: Keycloak integration
- **Features**: Responsive design, shopping cart, user dashboard

## Deployment

### AWS Infrastructure
- **Frontend**: Hosted on AWS S3 with CloudFront CDN
- **Backend**: Deployed on Amazon ECS (Elastic Container Service)
- **Containerization**: Docker with docker-compose configuration
- **Networking**: VPC with proper security groups and load balancers

## Local Development

### Prerequisites
- Java 17+
- Node.js 16+
- Maven 3.6+
- Docker & Docker Compose

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Build all microservices
mvn clean install

# Run with Docker Compose
docker-compose up -d
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend-react

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## API Endpoints

### Gateway Service
- `GET /api/orders/*` - Order management endpoints
- `GET /api/products/*` - Product catalog endpoints
- `GET /api/inventory/*` - Inventory management endpoints
- `GET /api/content/*` - Content management endpoints

### Key Features
- **User Management**: Registration, authentication, profile management
- **Product Catalog**: Browse products, categories, search functionality
- **Shopping Cart**: Add/remove items, quantity updates
- **Order Processing**: Checkout, order history, order tracking
- **Inventory Management**: Real-time stock tracking
- **Promotions**: Discount codes, special offers
- **Responsive Design**: Mobile-friendly interface

## Security
- **Authentication**: Keycloak integration for secure user authentication
- **Authorization**: Role-based access control
- **API Security**: JWT tokens, secure communication between services

## Monitoring & Logging
- **Spring Boot Actuator**: Health checks and metrics
- **Performance Monitoring**: Application performance tracking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Author

**Rishi** - Full Stack Developer
- Email: [Add your email]
- LinkedIn: [Add your LinkedIn profile]

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the author or create an issue in the repository.

---

## Quick Start Commands

```bash
# Clone the repository
git clone [repository-url]
cd Mcart

# Start backend services
cd backend
docker-compose up -d

# Start frontend (in new terminal)
cd frontend-react
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
