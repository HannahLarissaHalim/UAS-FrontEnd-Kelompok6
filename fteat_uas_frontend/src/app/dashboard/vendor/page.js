'use client';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Tab, Tabs } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import HomeNavbar from '../../components/HomeNavbar';
import ConfirmModal from '../../components/ConfirmModal';
import AlertModal from '../../components/AlertModal';
import { mockMenus, mockOrders, mockCategories } from '../../../utils/mockData';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function VendorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    estimatedTime: '5-10 menit',
    stock: '',
  });
  const [alertModal, setAlertModal] = useState({ show: false, title: '', message: '', variant: 'info' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      // Initialize state with the parsed user data outside of the effect
      const vendorId = parsedUser.id || 2; // Use actual vendor ID or fallback to 2
      
      // Use a single state update to avoid cascading renders
      const userMenus = mockMenus.filter(m => m.vendorId === vendorId);
      const userOrders = mockOrders.filter(o => o.vendorId === vendorId);
      
      // Batch state updates in the next tick to avoid synchronous updates in effect
      setTimeout(() => {
        setUser(parsedUser);
        setMenus(userMenus);
        setOrders(userOrders);
      }, 0);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]); // Remove unnecessary dependencies

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

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
      month: 'short',
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

  const handleShowMenuModal = (menu = null) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({
        name: menu.name,
        category: menu.category,
        price: menu.price.toString(),
        description: menu.description,
        estimatedTime: menu.estimatedTime,
        stock: menu.stock.toString(),
      });
    } else {
      setEditingMenu(null);
      setMenuForm({
        name: '',
        category: '',
        price: '',
        description: '',
        estimatedTime: '5-10 menit',
        stock: '',
      });
    }
    setShowMenuModal(true);
  };

  const handleCloseMenuModal = () => {
    setShowMenuModal(false);
    setEditingMenu(null);
  };

  const handleMenuFormChange = (e) => {
    setMenuForm({
      ...menuForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveMenu = async () => {
    // TODO: Call API to create/update menu
    // const response = await api.createMenu(menuForm, token);
    
    setAlertModal({ show: true, title: 'Berhasil', message: editingMenu ? 'Menu berhasil diupdate!' : 'Menu berhasil ditambahkan!', variant: 'success' });
    handleCloseMenuModal();
    // Refresh menus
  };

  const handleDeleteMenu = async (menuId) => {
    setMenuToDelete(menuId);
    setShowDeleteModal(true);
  };

  const confirmDeleteMenu = async () => {
    if (!menuToDelete) return;
    
    // TODO: Call API to delete menu
    // await api.deleteMenu(menuToDelete, token);
    
    setAlertModal({ show: true, title: 'Berhasil', message: 'Menu berhasil dihapus!', variant: 'success' });
    setShowDeleteModal(false);
    setMenuToDelete(null);
    // Refresh menus
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    // TODO: Call API to update order status
    // await api.updateOrderStatus(orderId, newStatus, token);
    
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setAlertModal({ show: true, title: 'Berhasil', message: `Status pesanan #${orderId} diupdate menjadi ${newStatus}`, variant: 'success' });
  };

  const calculateDailySales = () => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate).toDateString();
      return orderDate === today && order.status === 'Done';
    });
    
    return {
      count: todayOrders.length,
      revenue: todayOrders.reduce((sum, order) => sum + order.totalPrice, 0),
    };
  };

  const dailySales = calculateDailySales();

  if (!user) {
    return null;
  }

  return (
    <>
      <HomeNavbar />
      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm bg-success text-white">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <h3 className="mb-2">Vendor Dashboard</h3>
                    <p className="mb-0">Kelola menu dan pesanan Anda</p>
                  </Col>
                  <Col md={4} className="text-md-end">
                    <Button variant="light" onClick={handleLogout} size="sm">
                      Logout
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <div style={{ fontSize: '2rem' }}>🍽️</div>
                <h5 className="mt-2">{menus.length}</h5>
                <p className="text-muted mb-0">Total Menu</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <div style={{ fontSize: '2rem' }}>📦</div>
                <h5 className="mt-2">{orders.filter(o => o.status === 'Processing').length}</h5>
                <p className="text-muted mb-0">Pesanan Aktif</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <div style={{ fontSize: '2rem' }}>✅</div>
                <h5 className="mt-2">{dailySales.count}</h5>
                <p className="text-muted mb-0">Pesanan Hari Ini</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <div style={{ fontSize: '2rem' }}>💰</div>
                <h5 className="mt-2">{formatPrice(dailySales.revenue)}</h5>
                <p className="text-muted mb-0">Pendapatan Hari Ini</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="orders" className="mb-3">
          {/* Orders Tab */}
          <Tab eventKey="orders" title="Pesanan">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Daftar Pesanan</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {orders.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>ID</th>
                          <th>Tanggal</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{formatDate(order.orderDate)}</td>
                            <td>
                              {order.userName}
                              <br />
                              <small className="text-muted">{order.userId}</small>
                            </td>
                            <td>
                              {order.items.map((item, idx) => (
                                <div key={idx} className="small">
                                  {item.menuName} x{item.quantity}
                                </div>
                              ))}
                            </td>
                            <td className="fw-bold">{formatPrice(order.totalPrice)}</td>
                            <td>{getStatusBadge(order.status)}</td>
                            <td>
                              {order.status === 'Processing' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Done')}
                                >
                                  Selesai
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div style={{ fontSize: '4rem' }}>📭</div>
                    <h5 className="mt-3">Belum ada pesanan</h5>
                    <p className="text-muted">Pesanan akan muncul di sini</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>

          {/* Menu Management Tab */}
          <Tab eventKey="menus" title="Kelola Menu">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Daftar Menu</h5>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleShowMenuModal()}
                  >
                    + Tambah Menu
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Nama</th>
                        <th>Kategori</th>
                        <th>Harga</th>
                        <th>Stok</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menus.map(menu => (
                        <tr key={menu.id}>
                          <td>
                            <strong>{menu.name}</strong>
                            <br />
                            <small className="text-muted">{menu.description}</small>
                          </td>
                          <td>
                            <Badge bg="info">{menu.category}</Badge>
                          </td>
                          <td className="fw-bold">{formatPrice(menu.price)}</td>
                          <td>{menu.stock}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleShowMenuModal(menu)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteMenu(menu.id)}
                            >
                              Hapus
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab>

          {/* Sales Report Tab */}
          <Tab eventKey="report" title="Laporan">
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Laporan Penjualan Harian</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="p-4 bg-light rounded mb-3">
                      <h6 className="text-muted">Total Pesanan Selesai</h6>
                      <h2 className="mb-0">{dailySales.count}</h2>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-4 bg-light rounded mb-3">
                      <h6 className="text-muted">Total Pendapatan</h6>
                      <h2 className="mb-0 text-success">{formatPrice(dailySales.revenue)}</h2>
                    </div>
                  </Col>
                </Row>
                <p className="text-muted small">
                  * Laporan untuk tanggal {new Date().toLocaleDateString('id-ID')}
                </p>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>

      {/* Menu Modal */}
      <Modal show={showMenuModal} onHide={handleCloseMenuModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nama Menu</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={menuForm.name}
                onChange={handleMenuFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Kategori</Form.Label>
              <Form.Select
                name="category"
                value={menuForm.category}
                onChange={handleMenuFormChange}
                required
              >
                <option key="default-category" value="">Pilih Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Harga</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={menuForm.price}
                    onChange={handleMenuFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stok</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={menuForm.stock}
                    onChange={handleMenuFormChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={menuForm.description}
                onChange={handleMenuFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Estimasi Waktu</Form.Label>
              <Form.Control
                type="text"
                name="estimatedTime"
                value={menuForm.estimatedTime}
                onChange={handleMenuFormChange}
                placeholder="5-10 menit"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseMenuModal}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSaveMenu}>
            {editingMenu ? 'Update' : 'Simpan'}
          </Button>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setMenuToDelete(null);
        }}
        onConfirm={confirmDeleteMenu}
        title="Hapus Menu"
        message="Apakah kamu yakin ingin menghapus menu ini?"
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </>
  );
}
