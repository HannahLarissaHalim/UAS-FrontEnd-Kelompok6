'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from 'react-bootstrap';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../../utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '/historyorder.css';

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
    // fetch real orders for this user
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        // user id field may be _id or id
        const userId = parsedUser?._id || parsedUser?.id || parsedUser?.userId || parsedUser?.npm;
        console.log('[HistoryOrder] fetching orders for userId=', userId, 'token present=', !!token);
        const res = await api.getOrdersByUser(userId, token);
        console.log('[HistoryOrder] getOrdersByUser response:', res);
        if (res && res.success) {
          setOrders(res.data || []);
        } else {
          console.error('Failed to fetch user orders', res);
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders for user:', err);
        setOrders([]);
      }
    };

    fetchOrders();

    // listen for vendor verification events to refresh history
    const onOrderVerified = () => {
      fetchOrders();
    };
    window.addEventListener('orderVerified', onOrderVerified);
    return () => window.removeEventListener('orderVerified', onOrderVerified);
  }, [router]);

  const handleShowDetails = (order) => {
    // allow showing details when order is verified/paid
    const isVerified = order.paymentStatus === 'verified' || order.status === 'paid' || order.paymentStatus === 'paid';
    if (isVerified) {
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

  return (
    <ProtectedRoute> 
      <div className="history-order-page">
        <Navbar />
        
        {/* Back Button */}
        <button 
          className="back-button"
          onClick={() => router.push('/profile')}
          aria-label="Back to profile"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>
        
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
          {orders.map((order) => {
            const id = order._id || order.id;
            const createdAt = order.createdAt || order.date;
            const total = order.totalPrice || order.total || order.totalAmount;
            const paymentStatus = order.paymentStatus || order.status;
            const queueNumber = order.queueNumber || null;
            return (
              <div key={id} className="history-order-card">
                <div className="order-card-header">
                  <span className="order-date">kamu pada tanggal</span>
                  <span className="order-date-time">{formatDateFromISO(createdAt)} di</span>
                </div>

                <div className="order-card-items">
                  {(order.items || []).map((item, idx) => {
                    const itemName = item.name || item.menuItem?.name || 'Item';
                    const itemImage = item.image || item.menuItem?.image || '/images/ikon_indomie.png';
                    return (
                      <div key={idx} className="order-item-icon">
                        <Image 
                          src={itemImage} 
                          alt={itemName} 
                          width={80}
                          height={80}
                          unoptimized
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="order-card-vendor">
                  <span className="order-vendor-text">Total</span>
                </div>

                <div className="order-card-total">
                  <span className="order-total-amount">{formatPrice(total)}</span>
                  {queueNumber && <div className="order-queue">No. Antrian: {queueNumber}</div>}
                </div>

                <button 
                  className="order-details-btn"
                  onClick={() => handleShowDetails(order)}
                  disabled={!(paymentStatus === 'verified' || paymentStatus === 'paid')}
                >
                  Details
                </button>
              </div>
            );
          })}
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
                    <span className="modal-value">#{selectedOrder._id || selectedOrder.id}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Date:</span>
                    <span className="modal-value">{formatDateFromISO(selectedOrder.createdAt || selectedOrder.date)}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Vendor:</span>
                    <span className="modal-value">{selectedOrder.vendor || selectedOrder.vendorName || (selectedOrder.vendor?.stallName) || '-'}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Pickup Location:</span>
                    <span className="modal-value">{selectedOrder.pickupLocation || selectedOrder.location || '-'}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Payment Method:</span>
                    <span className="modal-value">{selectedOrder.paymentMethod || selectedOrder.payment_method || '-'}</span>
                  </div>
                  <div className="modal-info-row">
                    <span className="modal-label">Status:</span>
                    <span className={`modal-value ${selectedOrder.paymentStatus === 'verified' ? 'modal-status-verified' : 'modal-status-unpaid'}`}>
                      {selectedOrder.paymentStatus === 'verified' ? 'Verified' : (selectedOrder.paymentStatus || selectedOrder.status || 'Unknown')}
                    </span>
                  </div>
                  {selectedOrder.queueNumber && (
                    <div className="modal-info-row">
                      <span className="modal-label">No. Antrian:</span>
                      <span className="modal-value">{selectedOrder.queueNumber}</span>
                    </div>
                  )}
                </div>

                <div className="modal-items-section">
                  <h5 className="modal-section-title">Items Ordered:</h5>
                  <div className="modal-items-list">
                    {(selectedOrder.items || []).map((item, idx) => {
                          const name = item.name || item.menuItem?.name || 'Item';
                          const qty = item.quantity || item.qty || 1;
                          const price = item.price || item.menuItem?.price || item.unitPrice || 0;
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
