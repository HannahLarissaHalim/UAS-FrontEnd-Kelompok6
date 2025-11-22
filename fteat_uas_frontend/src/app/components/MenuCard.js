'use client';
import { useState } from 'react';
import { Card, Button, Badge, Modal, Form, ListGroup } from 'react-bootstrap';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MenuCard({ menu, onAddToCart, onBuyNow }) {
  // Safety Check: Jika menu kosong, return null atau placeholder
  if (!menu) {
      return (
          <Card className="menu-card text-center p-3">
              <p className="text-muted">Memuat data menu...</p>
          </Card>
      );
  }
    
  const [showModal, setShowModal] = useState(false);
  const [selectedAdditionals, setSelectedAdditionals] = useState({});

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAdditionals({});
  };

  const updateQuantity = (additionalName, change) => {
    setSelectedAdditionals(prev => {
      const currentQty = prev[additionalName] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        const { [additionalName]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [additionalName]: newQty };
    });
  };

  const calculateTotal = () => {
    let additionalsTotal = 0;
    if (menu.additionals) {
        Object.entries(selectedAdditionals).forEach(([name, qty]) => {
          const additional = menu.additionals.find(a => a.name === name);
          if (additional) {
            additionalsTotal += additional.price * qty;
          }
        });
    }
    return menu.price + additionalsTotal;
  };
  
  const getSelectedAdditionalsList = () => {
    const list = [];
    if (menu.additionals) {
        Object.entries(selectedAdditionals).forEach(([name, qty]) => {
          const additional = menu.additionals.find(a => a.name === name);
          if (additional && qty > 0) {
            list.push({ ...additional, quantity: qty });
          }
        });
    }
    return list;
  };

  const handleAddToCart = () => {
    onAddToCart({
      ...menu,
      selectedAdditionals: getSelectedAdditionalsList(),
      totalPrice: calculateTotal(),
    });
    handleCloseModal();
  };

  const handleBuyNow = () => {
    onBuyNow({
      ...menu,
      selectedAdditionals: getSelectedAdditionalsList(),
      totalPrice: calculateTotal(),
    });
    handleCloseModal();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Gunakan properti DB di sini:
  const displayVendor = menu.vendor || 'Kantin Teknik Bursa Lt.7'; 
  const displayTime = menu.time || '5-10 menit'; 
  const hasAdditionals = menu.additionals && menu.additionals.length > 0;


  return (
    <>
      <Card className="menu-card">
        <div className="menu-card-image">
          {menu.image ? (
            <Image 
              src={menu.image}
              alt={menu.name}
              fill
              className="menu-image"
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          ) : (
            <div className="menu-placeholder-icon">🍜</div>
          )}
        </div>
        <Card.Body className="menu-card-body">
          <div className="menu-badges">
            <Badge className="menu-badge-category">{menu.category}</Badge>
            {menu.brand && menu.category === "Instant Noodles" && (
              <Badge className="menu-badge-brand">{menu.brand}</Badge>
            )}
            <span className="menu-time">⏱️ {displayTime}</span> 
          </div>
          
          <h5 className="menu-card-title">{menu.name}</h5>
          
          <div className="menu-price-section">
            <span className="menu-price-label">Harga</span>
            <h4 className="menu-price">{formatPrice(menu.price)}</h4>
          </div>
          
          <p className="menu-vendor">{displayVendor}</p> 
          
          <div className="menu-card-actions">
            <Button 
              className="menu-btn-buy"
              onClick={hasAdditionals ? handleShowModal : handleBuyNow} 
            >
              Buy Now
            </Button>
            <Button 
              className="menu-btn-cart"
              onClick={hasAdditionals ? handleShowModal : handleAddToCart} 
            >
              🛒 Add to cart
            </Button>
          </div>
          
          {hasAdditionals && (
            <Button 
              className="menu-btn-additionals"
              onClick={handleShowModal}
            >
              + Additionals
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* Additionals Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered className="additionals-modal">
        <Modal.Header closeButton className="additionals-modal-header">
          <Modal.Title className="additionals-modal-title">{menu.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="additionals-modal-body">
          <h6 className="additionals-subtitle">Pilih Tambahan (Optional)</h6>
          {hasAdditionals ? (
            <>
              <ListGroup className="additionals-list">
                {menu.additionals.map((additional, index) => {
                  const quantity = selectedAdditionals[additional.name] || 0;
                  return (
                    <ListGroup.Item 
                      key={index}
                      className="additionals-list-item"
                    >
                      <div className="additionals-info">
                        <span className="additionals-name">{additional.name}</span>
                        <span className="additionals-price">{formatPrice(additional.price)}</span>
                      </div>
                      <div className="additionals-quantity-controls">
                        <Button 
                          variant="outline-secondary"
                          size="sm"
                          className="qty-btn qty-minus"
                          onClick={() => updateQuantity(additional.name, -1)}
                          disabled={quantity === 0}
                        >
                          -
                        </Button>
                        <span className="qty-display">{quantity}</span>
                        <Button 
                          variant="outline-primary"
                          size="sm"
                          className="qty-btn qty-plus"
                          onClick={() => updateQuantity(additional.name, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
              
              {/* Selected Additionals Summary */}
              {Object.keys(selectedAdditionals).length > 0 && (
                <div className="selected-additionals-summary">
                  <h6 className="summary-title">Terpilih:</h6>
                  {getSelectedAdditionalsList().map((item, idx) => (
                    <div key={idx} className="summary-item">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-muted">Tidak ada tambahan tersedia</p>
          )}

          {/* Total Price */}
          <div className="additionals-total">
            <div className="total-row">
              <span className="total-label">Harga Menu:</span>
              <span className="total-value">{formatPrice(menu.price)}</span>
            </div>
            {Object.keys(selectedAdditionals).length > 0 && (
              <div className="total-row">
                <span className="total-label">Tambahan:</span>
                <span className="total-value">
                  {formatPrice(getSelectedAdditionalsList().reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                </span>
              </div>
            )}
            <div className="total-row total-final">
              <strong className="total-label">Total:</strong>
              <strong className="total-value-final">{formatPrice(calculateTotal())}</strong>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="additionals-modal-footer">
          <Button variant="secondary" onClick={handleCloseModal} className="modal-btn-cancel">
            Batal
          </Button>
          <Button variant="outline-primary" onClick={handleAddToCart} className="modal-btn-cart">
            Add to Cart
          </Button>
          <Button variant="primary" onClick={handleBuyNow} className="modal-btn-buy">
            Buy Now
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}