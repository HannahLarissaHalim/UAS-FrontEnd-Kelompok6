'use client';
import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import Image from 'next/image';
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
    <div className="stand-indonesia-page">
      {/* Navbar */}
      <Navbar />


      {/* Stand Title */}
      <h1 className="stand-page-title">Stand</h1>

      {/* Kantin Bursa Lt.7 */}
      <h2
        className="stand-vendor-title stand-vendor-bursa"
        onClick={() => handleStandClick("Kantin Teknik Bursa Lt.7")}
      >
        Kantin Bursa Lt.7
      </h2>

      {/* Divider Line 1 */}
      <div className="stand-divider-line-1"></div>

      {/* Decorative Elements */}
      <div className="stand-decoration-rect-16"></div>
      <div className="stand-decoration-rect-15"></div>
      <div className="stand-decoration-rect-20"></div>

      {/* Kantin LupaNamanya */}
      <h2
        className="stand-vendor-title stand-vendor-lupa"
        onClick={() => handleStandClick("Kantin LupaNamanya")}
      >
        Kantin LupaNamanya
      </h2>

      {/* Segera hadir stand lainnya! */}
      <p className="stand-coming-soon">Segera hadir stand lainnya!</p>

      {/* Promo Box */}
      <div className="stand-promo-rectangle">
        <p className="stand-promo-text">
          Tertarik untuk memasarkan stand/tenant Anda dalam Website kami? Hubungi segera!
          Kami menawarkan biaya yang ramah dan murah untuk pemilik UMKM dan UKM.
          Informasi lebih lanjut: +62 851-1758-8969
        </p>
      </div>

      {/* Hubungi Button */}
      <div className="stand-contact-button-wrapper">
        <button className="stand-contact-button">Hubungi!</button>
      </div>

      {/* Footer */}
      <div className="stand-footer">
        <span className="stand-footer-text">Developed by </span>
        <span className="stand-footer-held">HELD</span>
      </div>

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

    </div>
  );
}
