'use client';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AlertModal({ 
  show, 
  onHide, 
  title = "Informasi", 
  message, 
  buttonText = "OK",
  variant = "info" // info, success, warning, error
}) {
  // Get colors based on variant
  const getColors = () => {
    switch(variant) {
      case 'success': 
        return { bg: '#14AE5C', icon: '✓', titleColor: '#14AE5C' };
      case 'warning': 
        return { bg: '#FFC107', icon: '⚠', titleColor: '#856404' };
      case 'error': 
        return { bg: '#DC3545', icon: '✕', titleColor: '#DC3545' };
      case 'info': 
      default: 
        return { bg: '#0A4988', icon: 'ℹ', titleColor: '#0A4988' };
    }
  };

  const colors = getColors();

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      size="sm"
    >
      <Modal.Body style={{ 
        fontFamily: 'Montserrat, sans-serif',
        padding: '2rem 1.5rem',
        textAlign: 'center'
      }}>
        {/* Icon Circle */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '1.5rem',
          color: 'white'
        }}>
          {colors.icon}
        </div>

        {/* Title */}
        <h5 style={{ 
          fontWeight: '600',
          fontSize: '1.1rem',
          color: colors.titleColor,
          marginBottom: '0.75rem'
        }}>
          {title}
        </h5>

        {/* Message */}
        <p style={{ 
          fontSize: '0.95rem',
          color: '#555',
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          {message}
        </p>

        {/* Button */}
        <Button 
          onClick={onHide}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '600',
            padding: '0.5rem 2rem',
            borderRadius: '8px',
            backgroundColor: colors.bg,
            borderColor: colors.bg,
            color: variant === 'warning' ? '#333' : 'white',
            minWidth: '120px'
          }}
        >
          {buttonText}
        </Button>
      </Modal.Body>
    </Modal>
  );
}
