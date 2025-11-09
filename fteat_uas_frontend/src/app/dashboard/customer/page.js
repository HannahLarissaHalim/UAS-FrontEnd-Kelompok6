'use client';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import HomeNavbar from '../../components/HomeNavbar';
import { mockOrders } from '../../../utils/mockData';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // TODO: Fetch orders from API
    // const fetchOrders = async () => {
    //   const response = await api.getOrdersByUser(user.id, token);
    //   setOrders(response.data);
    // };
    
    // Mock orders
    setOrders(mockOrders);
  }, [router]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Processing': 'warning',
      'Done': 'success',
      'Cancelled': 'danger',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <HomeNavbar />
      <Container className="py-5">

        <Row className="mb-4">
          <Col md={4}>
            <Card className="text-center shadow-sm h-100">
              <Card.Body>
                <div style={{ fontSize: '2rem' }}>📦</div>
                <h5 className="mt-2">{orders.length}</h5>
                <p className="text-muted mb-0">Total Pesanan</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center shadow-sm h-100">
              <Card.Body>
                <div style={{ fontSize: '2rem' }}>⏳</div>
                <h5 className="mt-2">
                  {orders.filter(o => o.status === 'Processing').length}
                </h5>
                <p className="text-muted mb-0">Sedang Diproses</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center shadow-sm h-100">
              <Card.Body>
                <div style={{ fontSize: '2rem' }}>✅</div>
                <h5 className="mt-2">
                  {orders.filter(o => o.status === 'Done').length}
                </h5>
                <p className="text-muted mb-0">Selesai</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Riwayat Pesanan</h5>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => router.push('/menu')}
                  >
                    + Pesan Lagi
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {orders.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>ID</th>
                          <th>Tanggal</th>
                          <th>Stand</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Lokasi</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{formatDate(order.orderDate)}</td>
                            <td>{order.vendorName}</td>
                            <td>
                              {order.items.map((item, idx) => (
                                <div key={idx} className="small">
                                  {item.menuName} x{item.quantity}
                                </div>
                              ))}
                            </td>
                            <td className="fw-bold">{formatPrice(order.totalPrice)}</td>
                            <td>{order.pickupLocation}</td>
                            <td>{getStatusBadge(order.status)}</td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => alert(`Detail pesanan #${order.id}`)}
                              >
                                Detail
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div style={{ fontSize: '4rem' }}>🍽️</div>
                    <h5 className="mt-3">Belum ada pesanan</h5>
                    <p className="text-muted">Yuk mulai pesan makanan favorit kamu!</p>
                    <Button 
                      variant="primary"
                      onClick={() => router.push('/menu')}
                    >
                      Lihat Menu
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
