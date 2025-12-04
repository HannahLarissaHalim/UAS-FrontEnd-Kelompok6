'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from 'react-bootstrap';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../../utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';
import './history-order.css';

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
    setUser(parsedUser);
    
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = parsedUser?._id || parsedUser?.id || parsedUser?.userId || parsedUser?.npm;
        const res = await api.getOrdersByUser(userId, token);
        if (res && res.success) {
          // Only show orders that have been verified/paid by vendor
          const verifiedOrders = (res.data || []).filter(order => 
            order.paymentStatus === 'verified' || 
            order.paymentStatus === 'paid' || 
            order.status === 'paid'
          );
          setOrders(verifiedOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders for user:', err);
        setOrders([]);
      }
    };

    fetchOrders();

    const onOrderVerified = () => fetchOrders();
    window.addEventListener('orderVerified', onOrderVerified);
    return () => window.removeEventListener('orderVerified', onOrderVerified);
  }, [router]);

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
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

  const formatDateFromISO = (iso) => {
    try {
      const d = new Date(iso);
      const day = d.getDate();
      const month = d.toLocaleString('id-ID', { month: 'short' });
      const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      return `${day} ${month}, jam ${time}`;
    } catch (e) {
      return iso;
    }
  };

  // Get user display name
  const getUserName = () => {
    if (!user) return '';
    return user.name || user.fullName || user.firstName || user.email?.split('@')[0] || 'User';
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute> 
      <div className="history-order-page">
        <Navbar />
        
        <div className="history-order-container">
          {/* Title Section */}
          <h1 className="history-main-title">Nomor Antrian kamu!</h1>
          
          {/* User Name Badge */}
          <div className="history-user-badge">
            <span>{getUserName()}</span>
          </div>

          {/* Queue Cards Grid */}
          <div className="queue-cards-grid">
            {orders.length === 0 ? (
              <p className="no-orders-message">Belum ada pesanan yang terverifikasi</p>
            ) : (
              orders.map((order) => {
                const id = order._id || order.id;
                const queueNumber = order.queueNumber || '---';
                // Get first item image or default
                const firstItem = order.items?.[0];
                const itemImage = firstItem?.image || firstItem?.menuItem?.image || '/images/ikon_indomie.png';
                
                return (
                  <div key={id} className="queue-card">
                    <div className="queue-card-image">
                      <Image 
                        src={itemImage}
                        alt="Order"
                        width={100}
                        height={100}
                        style={{ objectFit: 'contain' }}
                        unoptimized
                      />
                    </div>
                    <div className="queue-number-display">
                      {queueNumber}
                    </div>
                    <button 
                      className="queue-details-btn"
                      onClick={() => handleShowDetails(order)}
                    >
                      Details
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="homepage-footer">
            <p>Developed by <strong>HELD</strong></p>
          </div>
        </div>

        {/* Order Details Modal - Same as before */}
        <Modal show={showModal} onHide={handleCloseModal} centered className="order-details-modal">
          <Modal.Header closeButton className="order-modal-header">
            <Modal.Title className="order-modal-title">Order Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="order-modal-body">
            {selectedOrder && (
              <>
                <div className="modal-order-info">
                  <div className="modal-info-row">
                    <span className="modal-label">Order ID:</span>
                    <span className="modal-value">#{(selectedOrder._id || selectedOrder.id)?.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Date:</span>
                    <span className="modal-value">{formatDateFromISO(selectedOrder.createdAt || selectedOrder.date)}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Vendor:</span>
                    <span className="modal-value">{selectedOrder.vendor || selectedOrder.vendorName || '-'}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Pickup Location:</span>
                    <span className="modal-value">{selectedOrder.pickupLocation || '-'}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Payment Method:</span>
                    <span className="modal-value">{selectedOrder.paymentMethod || '-'}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Status:</span>
                    <span className="modal-value modal-status-verified">Verified</span>
                  </div>
                  {selectedOrder.queueNumber && (
                    <div className="modal-info-row">
                      <span className="modal-label">No. Antrian:</span>
                      <span className="modal-value modal-queue-highlight">{selectedOrder.queueNumber}</span>
                    </div>
                  )}
                </div>

                <div className="modal-items-section">
                  <h5 className="modal-section-title">Items Ordered:</h5>
                  <div className="modal-items-list">
                    {(selectedOrder.items || []).map((item, idx) => {
                      const name = item.name || item.menuItem?.name || 'Item';
                      const qty = item.quantity || 1;
                      const price = item.price || item.menuItem?.price || 0;
                      const img = item.image || item.menuItem?.image || '/images/ikon_indomie.png';
                      return (
                        <div key={idx} className="modal-item-row">
                          <div className="modal-item-image">
                            <Image 
                              src={img} 
                              alt={name} 
                              width={60}
                              height={60}
                              unoptimized
                            />
                          </div>
                          <div className="modal-item-details">
                            <span className="modal-item-name">{name}</span>
                            <span className="modal-item-quantity">x{qty}</span>
                          </div>
                          <div className="modal-item-price">
                            {formatPrice(price * qty)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="modal-total-section">
                  <div className="modal-total-row">
                    <span className="modal-total-label">Total:</span>
                    <span className="modal-total-value">{formatPrice(selectedOrder.totalPrice || selectedOrder.total)}</span>
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
