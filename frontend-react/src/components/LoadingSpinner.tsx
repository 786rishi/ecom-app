import React from 'react';
import { Spinner, Alert } from 'react-bootstrap';

interface LoadingSpinnerProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  centered?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'primary',
  size = 'md',
  text,
  fullScreen = false,
  centered = true,
  className = ''
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return { width: '1rem', height: '1rem' };
      case 'lg':
        return { width: '3rem', height: '3rem' };
      default:
        return { width: '2rem', height: '2rem' };
    }
  };

  const spinnerStyle = getSpinnerSize();

  const spinnerComponent = (
    <div className={`loading-spinner ${className}`}>
      <Spinner 
        animation="border" 
        variant={variant}
        style={spinnerStyle}
        role="status"
        aria-hidden="true"
      />
      {text && (
        <span className="ms-2 text-muted">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="d-flex justify-content-center align-items-center position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-75"
        style={{ zIndex: 9999 }}
      >
        {spinnerComponent}
      </div>
    );
  }

  if (centered) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        {spinnerComponent}
      </div>
    );
  }

  return spinnerComponent;
};

export default LoadingSpinner;

// Additional loading components for different contexts
export const LoadingCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`card ${className}`}>
    <div className="card-body placeholder-glow">
      <div className="placeholder w-100 mb-3" style={{ height: '200px' }}></div>
      <div className="placeholder w-75 mb-2" style={{ height: '20px' }}></div>
      <div className="placeholder w-50 mb-2" style={{ height: '16px' }}></div>
      <div className="placeholder w-25" style={{ height: '16px' }}></div>
    </div>
  </div>
);

export const LoadingSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`placeholder-glow ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div 
        key={index}
        className="placeholder mb-2" 
        style={{ 
          width: index === lines - 1 ? '75%' : '100%',
          height: '16px'
        }}
      ></div>
    ))}
  </div>
);

export const LoadingAlert: React.FC<{ 
  message?: string; 
  variant?: 'info' | 'warning' | 'primary';
}> = ({ 
  message = 'Loading...', 
  variant = 'info' 
}) => (
  <Alert variant={variant} className="d-flex align-items-center">
    <Spinner animation="border" size="sm" className="me-2" />
    {message}
  </Alert>
);
