'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Modal } from 'react-bootstrap';
import VendorNavbar from '../../components/VendorNavbar';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import './vendor-pesanan.css';
import ProtectedVendorRoute from '../../components/ProtectedVendorRoute';

export default function VendorPesananPage() {
  const router = useRouter();
  const [vendorData, setVendorData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', variant: 'info' });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');

    if (!user) {
      // fallback to dummy vendor until user logs in
      const dummy = {
        vendorName: 'Kantin Bursa Lt.7',
        email: 'fteat_kantinbursalt7@gmail.com',
        role: 'vendor',
        id: 'vendor123'
      };
      setVendorData(dummy);
      loadDummyOrders();
      return;
    }

    // Use real vendor data and fetch orders by vendor identifier
    const userData = JSON.parse(user);
    setVendorData(userData);

    // Determine vendor identifier used by backend: prefer VendorId
    const vendorIdentifier = userData?.VendorId || userData?.VendorID || userData?.vendorId || userData?._id || userData?.id || userData?.stallName || userData?.stallname || null;
    console.log('[VendorPesanan] vendorData from localStorage:', userData);
    console.log('[VendorPesanan] computed vendorIdentifier:', vendorIdentifier);

    if (!vendorIdentifier) {
      console.warn('[VendorPesanan] No vendor identifier found in stored user object, falling back to dummy orders');
      loadDummyOrders();
      return;
    }

    fetchOrders(String(vendorIdentifier));
  }, []);

  const loadDummyOrders = () => {
    // Dummy orders for testing
    const dummyOrders = [
      {
        _id: '1',
        createdAt: '2024-11-02T10:09:00',
        totalPrice: 70000,
        paymentStatus: 'unpaid',
        queueNumber: null,
        user: { name: 'John Doe', email: 'john@example.com' },
        items: [
          { name: 'Indomie Goreng', quantity: 2, price: 15000, image: '/images/ikon_indomie.png', additionals: ['Telur', 'Kornet'] },
          { name: 'Es Teh Manis', quantity: 2, price: 5000, image: '/images/ikon_gorengan.png', additionals: [] }
        ],
        paymentMethod: 'Cash',
        pickupLocation: 'Kantin Bursa Lt.7'
      },
      {
        _id: '2',
        createdAt: '2024-10-27T09:09:00',
        totalPrice: 35000,
        paymentStatus: 'verified',
        queueNumber: '002',
        user: { name: 'Jane Smith', email: 'jane@example.com' },
        items: [
          { name: 'Indomie Rebus', quantity: 1, price: 12000, image: '/images/ikon_indomie.png', additionals: ['Telur'] },
          { name: 'Teh Botol', quantity: 1, price: 5000, image: '/images/ikon_gorengan.png', additionals: [] }
        ],
        paymentMethod: 'E-Wallet',
        pickupLocation: 'Kantin Bursa Lt.7'
      },
      {
        _id: '3',
        createdAt: '2024-10-18T13:12:00',
        totalPrice: 35000,
        paymentStatus: 'verified',
        queueNumber: '003',
        user: { name: 'Bob Wilson', email: 'bob@example.com' },
        items: [
          { name: 'Indomie Goreng Jumbo', quantity: 1, price: 18000, image: '/images/ikon_indomie.png', additionals: ['Telur', 'Sosis', 'Keju'] }
        ],
        paymentMethod: 'Transfer',
        pickupLocation: 'Kantin Bursa Lt.7'
      },
      {
        _id: '4',
        createdAt: '2024-10-10T11:27:00',
        totalPrice: 8000,
        paymentStatus: 'unpaid',
        queueNumber: null,
        user: { name: 'Alice Brown', email: 'alice@example.com' },
        items: [
          { name: 'Es Teh Manis', quantity: 1, price: 5000, image: '/images/ikon_gorengan.png', additionals: [] }
        ],
        paymentMethod: 'Cash',
        pickupLocation: 'Kantin Bursa Lt.7'
      }
    ];
    setOrders(dummyOrders);
    setLoading(false);
  };

  const fetchOrders = async (vendorId) => {
    try {
      const token = localStorage.getItem('token');
      // Use frontend api helper if available
      const apiModule = await import('../../../utils/api');
      const api = apiModule.api || apiModule.default || apiModule;

      console.log('[VendorPesanan] calling getOrdersByVendor with vendorId=', vendorId);
      const res = await api.getOrdersByVendor(encodeURIComponent(vendorId), token);
      console.log('[VendorPesanan] getOrdersByVendor response:', res);

      if (res && res.success) {
        setOrders(res.data || []);
      } else {
        console.error('Failed to load orders for vendor', res);
        // Show empty orders rather than breaking the UI
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHomeClick = () => {
    router.push('/vendor-welcome');
  };

  const handleMenuClick = () => {
    router.push('/vendor-menu');
  };

  const handleVerifyPayment = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const vendorIdentifier = vendorData?.VendorId || vendorData?.vendorId || vendorData?._id || vendorData?.id || vendorData?.VendorID;
      const { api } = await import('../../../utils/api');
      const res = await api.verifyOrder(orderId, vendorIdentifier, token);
      console.log('[VendorPesanan] verifyOrder response:', res);

      if (res && res.success) {
        // Get queueNumber from response - it's in res.data (the order object)
        const queueNumber = res.data?.queueNumber || res.queueNumber || 'N/A';
        
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, paymentStatus: 'verified', queueNumber: queueNumber }
            : order
        ));
        setAlertModal({ show: true, title: 'Berhasil', message: `Pembayaran berhasil diverifikasi! Nomor antrian: ${queueNumber}`, variant: 'success' });
        // Notify other parts of the app (e.g., student's history page) to refresh
        try {
          window.dispatchEvent(new CustomEvent('orderVerified', { detail: { orderId } }));
        } catch (e) {
          // ignore if CustomEvent not supported
          window.dispatchEvent(new Event('orderVerified'));
        }
      } else {
        setAlertModal({ show: true, title: 'Gagal', message: 'Gagal memverifikasi pembayaran: ' + (res?.message || 'Unknown'), variant: 'error' });
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setAlertModal({ show: true, title: 'Error', message: 'Terjadi kesalahan saat memverifikasi pembayaran', variant: 'error' });
    }

    // TODO: Uncomment when backend is ready
    // try {
    //   const response = await fetch(`/api/orders/${orderId}/verify`, {
    //     method: 'PATCH',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     },
    //     body: JSON.stringify({ vendorId: vendorData.id })
    //   });
    //   
    //   const data = await response.json();
    //   if (data.success) {
    //     setOrders(orders.map(order => 
    //       order._id === orderId 
    //         ? { ...order, paymentStatus: 'verified', queueNumber: data.data.queueNumber }
    //         : order
    //     ));
    //     alert(`Pembayaran berhasil diverifikasi! Nomor antrian: ${data.data.queueNumber}`);
    //   } else {
    //     alert('Gagal memverifikasi pembayaran: ' + data.message);
    //   }
    // } catch (error) {
    //   console.error('Error verifying payment:', error);
    //   alert('Terjadi kesalahan saat memverifikasi pembayaran');
    // }
  };

  const handleCancelVerification = (orderId) => {
    setOrderToCancel(orderId);
    setShowCancelModal(true);
  };

  const confirmCancelVerification = async () => {
    if (!orderToCancel) return;
    const orderId = orderToCancel;
    setShowCancelModal(false);
    setOrderToCancel(null);

    try {
      const token = localStorage.getItem('token');
      const { api } = await import('../../../utils/api');
      const res = await api.cancelOrderVerification(orderId, token);
      console.log('[VendorPesanan] cancelOrderVerification response:', res);

      if (res && res.success) {
        setOrders(orders.map(order =>
          order._id === orderId
            ? { ...order, paymentStatus: 'unpaid', queueNumber: null }
            : order
        ));
        setAlertModal({ show: true, title: 'Berhasil', message: 'Verifikasi pembayaran berhasil dibatalkan', variant: 'success' });
        // Notify other parts of the app (e.g., student's history page) to refresh
        try {
          window.dispatchEvent(new CustomEvent('orderVerified', { detail: { orderId } }));
        } catch (e) {
          window.dispatchEvent(new Event('orderVerified'));
        }
      } else {
        setAlertModal({ show: true, title: 'Gagal', message: 'Gagal membatalkan verifikasi: ' + (res?.message || 'Unknown'), variant: 'error' });
      }
    } catch (err) {
      console.error('Error canceling verification:', err);
      setAlertModal({ show: true, title: 'Error', message: 'Terjadi kesalahan saat membatalkan verifikasi', variant: 'error' });
    }

    // TODO: Uncomment when backend is ready
    // try {
    //   const response = await fetch(`/api/orders/${orderId}/cancel-verification`, {
    //     method: 'PATCH',
    //     headers: {
    //       'Authorization': `Bearer ${localStorage.getItem('token')}`
    //     }
    //   });
    //   
    //   const data = await response.json();
    //   if (data.success) {
    //     setOrders(orders.map(order => 
    //       order._id === orderId 
    //         ? { ...order, paymentStatus: 'unpaid', queueNumber: null }
    //         : order
    //     ));
    //     alert('Verifikasi pembayaran berhasil dibatalkan');
    //   } else {
    //     alert('Gagal membatalkan verifikasi: ' + data.message);
    //   }
    // } catch (error) {
    //   console.error('Error canceling verification:', error);
    //   alert('Terjadi kesalahan saat membatalkan verifikasi');
    // }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('id-ID', { month: 'short' });
    const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return { date: `${day} ${month}`, time: `jam ${time}` };
  };

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

  if (!vendorData) {
    return null;
  }

  return (
    <ProtectedVendorRoute>
    <div className="vendor-page">
      <VendorNavbar />

      {/* Main Content */}
      <div className="vendor-content">
        <div className="pesanan-header">
          <svg width="63" height="63" viewBox="0 0 63 63" fill="none" className="pesanan-icon">
            <path d="M10.5 10.5H52.5V52.5H10.5V10.5Z" stroke="#0A4988" strokeWidth="4" />
            <path d="M21 21H42M21 31.5H42M21 42H31.5" stroke="#0A4988" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <h1 className="pesanan-title">Pesanan</h1>
          <div className="stand-icon-circle">
            <Image
              src="/images/ikon_indomie.png"
              alt="Stand Icon"
              width={100}
              height={100}
              unoptimized
            />
          </div>
        </div>

        <div className="orders-grid">
          {loading ? (
            <p className="loading-text">Memuat pesanan...</p>
          ) : orders.length === 0 ? (
            <p className="no-orders-text">Belum ada pesanan</p>
          ) : (
            orders.map((order) => {
              const { date, time } = formatDate(order.createdAt);
              const isVerified = order.paymentStatus === 'verified';

              return (
                <div key={order._id} className="order-card">
                  {/* Left Box: Order Info */}
                  <div className="order-info-box">
                    <div className="order-date-time">
                      <span className="order-date">{date}, {time}</span>
                    </div>

                    <div className="queue-number-box">
                      <span className="queue-number">{order.queueNumber || '---'}</span>
                    </div>

                    <div className="order-price">
                      <span>Rp. {order.totalPrice.toLocaleString('id-ID')}</span>
                    </div>

                    <button className="details-btn" onClick={() => handleShowDetails(order)}>Details</button>
                  </div>

                  {/* Vertical Divider */}
                  <div className="order-divider"></div>

                  {/* Right Side: Actions */}
                  <div className="order-actions">
                    <div className={`payment-status ${isVerified ? 'verified' : 'unverified'}`}>
                      {isVerified ? 'Sudah Bayar' : 'Belum Bayar'}
                    </div>

                    <div className="action-buttons">
                      <button className="verify-btn" onClick={() => handleVerifyPayment(order._id)} disabled={isVerified}>
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                          <circle cx="22" cy="22" r="20" fill="#14AE5C" />
                          <path d="M14 22L19 27L30 16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button className="action-text" onClick={() => handleVerifyPayment(order._id)} disabled={isVerified}>
                        Verifikasi Pembayaran
                      </button>
                    </div>

                    <div className="action-buttons">
                      <button className="cancel-btn" onClick={() => handleCancelVerification(order._id)}>
                        <svg width="41" height="42" viewBox="0 0 41 42" fill="none">
                          <circle cx="20.5" cy="21" r="20" fill="#A52334" />
                          <path d="M14 15L27 28M27 15L14 28" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button className="action-text" onClick={() => handleCancelVerification(order._id)}>
                        Batalkan Verifikasi
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="stand-footer">
        <span className="stand-footer-text">Developed by </span>
        <span className="stand-footer-held">HELD</span>
      </div>

      {/* Order Details Modal */}
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
                  <span className="modal-value">#{selectedOrder._id?.slice(-6).toUpperCase() || '------'}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-label">Date:</span>
                  <span className="modal-value">{formatDate(selectedOrder.createdAt).date}, {formatDate(selectedOrder.createdAt).time}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-label">Pickup Location:</span>
                  <span className="modal-value">{selectedOrder.pickupLocation}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-label">Payment Status:</span>
                  <span className={`modal-value ${selectedOrder.paymentStatus === 'verified' ? 'modal-status-verified' : 'modal-status-unpaid'}`}>
                    {selectedOrder.paymentStatus === 'verified' ? 'Verified' : 'Unpaid'}
                  </span>
                </div>
                {selectedOrder.queueNumber && (
                  <div className="modal-info-row">
                    <span className="modal-label">Queue Number:</span>
                    <span className="modal-value modal-queue-number">{selectedOrder.queueNumber}</span>
                  </div>
                )}
              </div>

              <div className="modal-items-section">
                <h5 className="modal-section-title">Items Ordered:</h5>
                <div className="modal-items-list">
                  {selectedOrder.items.map((item, idx) => {
                    const itemImage = item.image || '/images/ikon_indomie.png';
                    const itemName = item.name || 'Menu';
                    const itemPrice = item.price || 0;
                    return (
                      <div key={idx} className="modal-item-row">
                        <div className="modal-item-image" style={{ minWidth: '80px', width: '80px', height: '80px' }}>
                          {itemImage ? (
                            <Image
                              src={itemImage}
                              alt={itemName}
                              width={80}
                              height={80}
                              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                              unoptimized
                            />
                          ) : (
                            <div style={{ width: 80, height: 80, background: '#eee', borderRadius: 8 }} />
                          )}
                        </div>
                        <div className="modal-item-details">
                          <span className="modal-item-name">{itemName}</span>
                          <span className="modal-item-quantity">x{item.quantity}</span>
                          {item.additionals && item.additionals.length > 0 && (
                            <span className="modal-item-additionals">
                              + {item.additionals.join(', ')}
                            </span>
                          )}
                        </div>
                        <div className="modal-item-price">
                          {formatPrice(itemPrice * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-total-section">
                <div className="modal-total-row">
                  <span className="modal-total-label">Total:</span>
                  <span className="modal-total-value">{formatPrice(selectedOrder.totalPrice)}</span>
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

      {/* Alert Modal */}
      <AlertModal
        show={alertModal.show}
        onHide={() => setAlertModal({ ...alertModal, show: false })}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />

      {/* Cancel Verification Confirmation Modal */}
      <ConfirmModal
        show={showCancelModal}
        onHide={() => {
          setShowCancelModal(false);
          setOrderToCancel(null);
        }}
        onConfirm={confirmCancelVerification}
        title="Batalkan Verifikasi"
        message="Apakah Anda yakin ingin membatalkan verifikasi pembayaran?"
        confirmText="Ya, Batalkan"
        cancelText="Tidak"
        variant="warning"
      />
    </div>
    </ProtectedVendorRoute>
  );
}
