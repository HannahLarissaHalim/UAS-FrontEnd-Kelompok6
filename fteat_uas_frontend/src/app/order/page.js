'use client';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Form, Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import HomeNavbar from '../components/HomeNavbar';
import AlertModal from '../components/AlertModal';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function OrderPage() {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', variant: 'info' });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // Get order items from localStorage
    const tempOrder = localStorage.getItem('tempOrder');
    if (tempOrder) {
      setOrderItems(JSON.parse(tempOrder));
    } else {
      router.push('/menu');
    }
  }, [router]);

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const itemTotal = item.totalPrice || item.price;
      return sum + (itemTotal * (item.quantity || 1));
    }, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleConfirmOrder = async () => {
    setError('');
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await api.createOrder(orderData, userToken);
      
      // Mock order creation
      const orderData = {
        userId: user.npm,
        userName: user.name,
        items: orderItems,
        totalPrice: calculateTotal(),
        status: 'Processing',
        orderDate: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear temp order
      localStorage.removeItem('tempOrder');

      // Redirect to success page or dashboard
      setAlertModal({ show: true, title: 'Berhasil', message: 'Pesanan berhasil dibuat! Status: Processing', variant: 'success' });
      setTimeout(() => { router.push('/dashboard/customer'); }, 1500);
    } catch (err) {
      setError('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || orderItems.length === 0) {
    return null;
  }

  return (
    <>
      <HomeNavbar />
      <Container className="py-5">
        <h2 className="text-center mb-4 fw-bold">Konfirmasi Pesanan</h2>

        <Row>
          <Col lg={8} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Detail Pesanan</h5>
              </Card.Header>
              <ListGroup variant="flush">
                {orderItems.map((item, index) => (
                  <ListGroup.Item key={index} className="py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold">{item.name}</h6>
                        <small className="text-muted">{item.vendorName}</small>
                        
                        {item.selectedAdditionals && item.selectedAdditionals.length > 0 && (
                          <div className="mt-2">
                            <small className="text-muted">Tambahan:</small>
                            {item.selectedAdditionals.map((add, idx) => (
                              <div key={idx} className="ms-3">
                                <small>+ {add.name} ({formatPrice(add.price)})</small>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <small>Jumlah: {item.quantity || 1}</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <strong className="text-primary">
                          {formatPrice((item.totalPrice || item.price) * (item.quantity || 1))}
                        </strong>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm mb-3">
              <Card.Header className="bg-light">
                <h6 className="mb-0">Informasi Pemesan</h6>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Nama</Form.Label>
                  <Form.Control
                    type="text"
                    value={user.name}
                    disabled
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>NPM</Form.Label>
                  <Form.Control
                    type="text"
                    value={user.npm}
                    disabled
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <strong>{formatPrice(calculateTotal())}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total</strong>
                  <strong className="text-primary fs-5">{formatPrice(calculateTotal())}</strong>
                </div>

                {error && <Alert variant="danger" className="small">{error}</Alert>}

                <Button
                  variant="primary"
                  className="w-100 mb-2"
                  onClick={handleConfirmOrder}
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Konfirmasi Pesanan'}
                </Button>

                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={() => router.push('/menu')}
                  disabled={loading}
                >
                  Kembali ke Menu
                </Button>
              </Card.Body>
            </Card>

            <Alert variant="info" className="small">
              <strong>Estimasi waktu:</strong> 5-15 menit
              <br />
              <strong>Lokasi pengambilan:</strong> Akan dikonfirmasi setelah pesanan dibuat
            </Alert>
          </Col>
        </Row>
      </Container>

      {/* Alert Modal */}
      <AlertModal
        show={alertModal.show}
        onHide={() => setAlertModal({ ...alertModal, show: false })}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />
    </>
  );
}
