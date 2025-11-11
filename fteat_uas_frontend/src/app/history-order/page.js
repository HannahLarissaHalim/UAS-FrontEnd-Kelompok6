'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from 'react-bootstrap';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

export default function HistoryOrderPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(parsedUser);

    // Mock orders data - replace with actual API call
    const mockOrders = [
      {
        id: 1,
        date: '27 Okt, jam 13.05',
        vendor: 'Stand A',
        vendorIcon: '/images/ikon_indomie.png',
        items: [
          { name: 'Nasi Goreng', quantity: 2, price: 25000, image: '/images/ikon_gorengan.png' },
          { name: 'Es Teh', quantity: 2, price: 5000, image: '/images/ikon_indomie.png' }
        ],
        total: 70000,
        status: 'authorized', // authorized or pending
        paymentMethod: 'Cash',
        pickupLocation: 'Kantin Utara'
      },
      {
        id: 2,
        date: '5 Nov, jam 14.05',
        vendor: 'Stand B',
        vendorIcon: '/images/ikon_gorengan.png',
        items: [
          { name: 'Mie Ayam', quantity: 1, price: 30000, image: '/images/ikon_indomie.png' }
        ],
        total: 30000,
        status: 'authorized',
        paymentMethod: 'E-Wallet',
        pickupLocation: 'Kantin Selatan'
      },
      {
        id: 3,
        date: '10 Nov, jam 11.05',
        vendor: 'Stand C',
        vendorIcon: '/images/ikon_indomie.png',
        items: [
          { name: 'Soto Ayam', quantity: 1, price: 35000, image: '/images/ikon_gorengan.png' },
          { name: 'Es Jeruk', quantity: 1, price: 5000, image: '/images/ikon_indomie.png' }
        ],
        total: 70000,
        status: 'authorized',
        paymentMethod: 'Cash',
        pickupLocation: 'Kantin Barat'
      },
      {
        id: 4,
        date: '5 Nov, jam 13.05',
        vendor: 'Stand D',
        vendorIcon: '/images/ikon_gorengan.png',
        items: [
          { name: 'Bakso', quantity: 1, price: 30000, image: '/images/ikon_indomie.png' }
        ],
        total: 30000,
        status: 'authorized',
        paymentMethod: 'Transfer',
        pickupLocation: 'Kantin Timur'
      },
      {
        id: 5,
        date: '5 Nov, jam 13.05',
        vendor: 'Stand E',
        vendorIcon: '/images/ikon_indomie.png',
        items: [
          { name: 'Ayam Geprek', quantity: 1, price: 30000, image: '/images/ikon_gorengan.png' }
        ],
        total: 30000,
        status: 'authorized',
        paymentMethod: 'Cash',
        pickupLocation: 'Kantin Utara'
      }
    ];

    setOrders(mockOrders);
  }, [router]);

  const handleShowDetails = (order) => {
    if (order.status === 'authorized') {
      setSelectedOrder(order);
      setShowModal(true);
    } else {
      alert('Payment is still pending vendor authorization');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute> 
      <div className="history-order-page">
        <Navbar />
        
        {/* History Order Title */}
        <div className="history-order-header">
          <svg className="history-icon" width="68" height="68" viewBox="0 0 68 68" fill="none">
            <rect x="14" y="14" width="40" height="48" stroke="#0A4988" strokeWidth="4" rx="2"/>
            <line x1="22" y1="26" x2="46" y2="26" stroke="#0A4988" strokeWidth="3"/>
            <line x1="22" y1="36" x2="46" y2="36" stroke="#0A4988" strokeWidth="3"/>
            <line x1="22" y1="46" x2="38" y2="46" stroke="#0A4988" strokeWidth="3"/>
          </svg>
          <h1 className="history-order-title">History Order</h1>
        </div>

        {/* Order Cards Grid */}
        <div className="history-orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="history-order-card">
              <div className="order-card-header">
                <span className="order-date">kamu pada tanggal</span>
                <span className="order-date-time">{order.date} di</span>
              </div>
              
              <div className="order-card-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-icon">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      width={80}
                      height={80}
                      unoptimized
                    />
                  </div>
                ))}
              </div>

              <div className="order-card-vendor">
                <span className="order-vendor-text">menghabiskan</span>
              </div>

              <div className="order-card-total">
                <span className="order-total-amount">{formatPrice(order.total)}</span>
              </div>

              <button 
                className="order-details-btn"
                onClick={() => handleShowDetails(order)}
                disabled={order.status !== 'authorized'}
              >
                Details
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="history-footer">
          <span className="history-footer-text">Developed by </span>
          <span className="history-footer-text history-footer-held">HELD</span>
        </div>

        {/* Order Details Modal */}
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton className="order-modal-header">
            <Modal.Title className="order-modal-title">Order Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="order-modal-body">
            {selectedOrder && (
              <>
                <div className="modal-order-info">
                  <div className="modal-info-row">
                    <span className="modal-label">Order ID:</span>
                    <span className="modal-value">#{selectedOrder.id}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Date:</span>
                    <span className="modal-value">{selectedOrder.date}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Vendor:</span>
                    <span className="modal-value">{selectedOrder.vendor}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Pickup Location:</span>
                    <span className="modal-value">{selectedOrder.pickupLocation}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Payment Method:</span>
                    <span className="modal-value">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Status:</span>
                    <span className="modal-value modal-status-authorized">Authorized</span>
                  </div>
                </div>

                <div className="modal-items-section">
                  <h5 className="modal-section-title">Items Ordered:</h5>
                  <div className="modal-items-list">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="modal-item-row">
                        <div className="modal-item-image">
                          <Image 
                            src={item.image} 
                            alt={item.name} 
                            width={60}
                            height={60}
                            unoptimized
                          />
                        </div>
                        <div className="modal-item-details">
                          <span className="modal-item-name">{item.name}</span>
                          <span className="modal-item-quantity">x{item.quantity}</span>
                        </div>
                        <div className="modal-item-price">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-total-section">
                  <div className="modal-total-row">
                    <span className="modal-total-label">Total:</span>
                    <span className="modal-total-value">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="order-modal-footer">
            <button className="modal-close-btn" onClick={handleCloseModal}>
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
