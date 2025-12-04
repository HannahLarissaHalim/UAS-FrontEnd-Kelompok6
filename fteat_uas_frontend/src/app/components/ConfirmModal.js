'use client';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ConfirmModal({ 
  show, 
  onHide, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger" // danger, warning, primary
}) {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header 
        closeButton 
        style={{ 
          borderBottom: 'none',
          position: 'relative',
          justifyContent: 'center'
        }}
      >
        <Modal.Title style={{ 
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: '600',
          fontSize: '1.25rem',
          color: '#333',
          textAlign: 'center',
          width: '100%'
        }}>
          {title}
        </Modal.Title>
        <style jsx global>{`
          .modal-header .btn-close {
            filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%) !important;
            opacity: 1 !important;
          }
          .modal-header .btn-close:hover {
            filter: invert(16%) sepia(98%) saturate(2476%) hue-rotate(346deg) brightness(95%) contrast(89%) !important;
            opacity: 1 !important;
          }
        `}</style>
      </Modal.Header>
      
      <Modal.Body style={{ 
        fontFamily: 'Montserrat, sans-serif',
        fontSize: '1rem',
        color: '#555',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        {message}
      </Modal.Body>
      
      <Modal.Footer style={{ borderTop: 'none', gap: '0.5rem', justifyContent: 'center' }}>
        <Button 
          onClick={onHide}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '500',
            padding: '0.5rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#6c757d'
          }}
        >
          {cancelText}
        </Button>
        <Button 
          variant={variant}
          onClick={onConfirm}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '600',
            padding: '0.5rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: '#DC3545',
            borderColor: '#DC3545',
            color: 'white'
          }}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
