'use client';
import { useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Modal } from 'react-bootstrap';
import Image from 'next/image';
//import HomeNavbar from '../components/HomeNavbar';
import Navbar from '../components/Navbar';
import { mockMenus } from '../../utils/mockData';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

export default function StandPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedStand, setSelectedStand] = useState(null);
  const [standMenus, setStandMenus] = useState([]);

  const handleStandClick = (standName) => {
    const menus = mockMenus.filter(menu => menu.vendorName === standName);
    setSelectedStand(standName);
    setStandMenus(menus);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStand(null);
    setStandMenus([]);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="stand-page">
      {/* global navbar (flat layout, no background container) */}
      <Navbar />

      <Container className="stand-container">
        <Row className="stand-content">
          {/* Left: Vendor List */}
          <Col lg={7} md={12} className="stand-list-col">
            <div className="stand-list">
              <h3 
                className="stand-list-title clickable"
                onClick={() => handleStandClick("Kantin Teknik Bursa Lt.7")}
              >
                Kantin Bursa Lt.7
              </h3>
              <div className="stand-divider"></div>
              <h3 
                className="stand-list-title clickable"
                onClick={() => handleStandClick("Kantin LupaNamanya")}
              >
                Kantin LupaNamanya
              </h3>
              <div className="stand-divider"></div>
              <p className="stand-more-text">Segera hadir stand lainnya!</p>
            </div>
          </Col>

          {/* Right: Promotion Info */}
          <Col lg={5} md={12} className="stand-promo-col">
            <div className="stand-promo-box">
              <h4 className="promo-title">Tertarik untuk memasarkan stand/tenant Anda dalam Website kami? Hubungi segera!</h4>
              
              <p className="promo-text">
                Kami menawarkan biaya yang ramah dan murah untuk pemilik UMKM dan UKM.
              </p>
              
              <p className="promo-contact">
                Informasi lebih lanjut: <strong>+62 851-1758-8969</strong>
              </p>
              
              <Button className="promo-button">
                Hubungi!
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
      
      {/* Stand Menu Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered className="stand-menu-modal">
        <Modal.Header closeButton className="stand-modal-header">
          <Modal.Title className="stand-modal-title">{selectedStand}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="stand-modal-body">
          {standMenus.length > 0 ? (
            <div className="stand-menu-list">
              {standMenus.map(menu => (
                <div key={menu.id} className="stand-menu-item">
                  <div className="stand-menu-info">
                    <h5 className="stand-menu-name">{menu.name}</h5>
                    <p className="stand-menu-description">{menu.description}</p>
                    <div className="stand-menu-meta">
                      <span className="stand-menu-category">{menu.category}</span>
                      <span className="stand-menu-time">⏱️ {menu.estimatedTime}</span>
                    </div>
                  </div>
                  <div className="stand-menu-price">
                    <span className="price-label">Harga</span>
                    <span className="price-value">{formatPrice(menu.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">Belum ada menu tersedia untuk stand ini</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="stand-modal-footer">
          <Button variant="secondary" onClick={handleCloseModal}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Footer */}
      <div className="homepage-footer">
        <p>Developed by <strong>HELD</strong></p>
      </div>
    </div>
  );
}
