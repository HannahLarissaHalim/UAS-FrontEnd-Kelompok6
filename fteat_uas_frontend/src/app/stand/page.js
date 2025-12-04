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

      {/* Stand List Container */}
      <div className="stand-list-container">
        {/* Kantin Bursa Lt.7 */}
        <div className="stand-item" onClick={() => handleStandClick("Kantin Teknik Bursa Lt.7")}>
          <div className="stand-item-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="stand-item-name">Kantin Bursa Lt.7</span>
          <div className="stand-item-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Divider */}
        <div className="stand-divider"></div>

        {/* Kantin LupaNamanya */}
        <div className="stand-item" onClick={() => handleStandClick("Kantin LupaNamanya")}>
          <div className="stand-item-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="stand-item-name">Kantin LupaNamanya</span>
          <div className="stand-item-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Divider */}
        <div className="stand-divider"></div>

        {/* Segera hadir stand lainnya! */}
        <p className="stand-coming-soon">Segera hadir stand lainnya!</p>
      </div>

      {/* Decorative Elements - Desktop Only */}
      <div className="stand-decoration-rect-16"></div>
      <div className="stand-decoration-rect-15"></div>
      <div className="stand-decoration-rect-20"></div>

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
