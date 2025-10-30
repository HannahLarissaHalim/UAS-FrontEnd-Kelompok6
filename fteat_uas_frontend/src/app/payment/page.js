'use client';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import HomeNavbar from '../components/HomeNavbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

export default function PaymentPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState({
    items: [],
    total: 0
  });

  useEffect(() => {
    // Get order data from localStorage or state management
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder));
    } else {
      // Sample data for demo (you can remove this in production)
      setOrderData({
        items: [
          { name: 'Mie Goreng Sakura', quantity: 1, price: 8000, additionals: [{ name: 'Eggs', quantity: 2, price: 10000 }] },
          { name: 'Corned Beef', quantity: 1, price: 5000, additionals: [] }
        ],
        total: 23000
      });
    }
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleOrderAndPay = () => {
    // Handle order and pay on-site logic
    alert('Pesanan akan dibayar di tempat. Silahkan menuju kasir!');
    localStorage.removeItem('currentOrder');
    router.push('/menu');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="payment-page">
      <HomeNavbar />
      
      <Container className="payment-container">
        <Row className="payment-content">
          {/* Left: Logo */}
          <Col lg={5} md={12} className="payment-logo-col">
            <div className="payment-logo-wrapper">
              <Image 
                src="/logo.png" 
                alt="FTeat Logo" 
                width={500} 
                height={500}
                className="payment-logo"
              />
            </div>
          </Col>

          {/* Right: Payment Details */}
          <Col lg={7} md={12} className="payment-details-col">
            <div className="payment-card">
              <h2 className="payment-title">Payment</h2>
              
              <div className="payment-section">
                <h4 className="payment-section-title">Orders</h4>
                
                <div className="payment-orders-list">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="payment-order-item">
                      <div className="payment-order-row">
                        <span className="payment-item-name">{item.name}</span>
                        <span className="payment-item-qty">x{item.quantity}</span>
                        <span className="payment-item-price">{formatPrice(item.price)}</span>
                      </div>
                      
                      {item.additionals && item.additionals.length > 0 && (
                        <div className="payment-additionals">
                          {item.additionals.map((add, addIndex) => (
                            <div key={addIndex} className="payment-additional-row">
                              <span className="payment-additional-name">{add.name}</span>
                              <span className="payment-additional-qty">x{add.quantity}</span>
                              <span className="payment-additional-price">{formatPrice(add.price)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="payment-note">
                  <span className="payment-note-text">No Cancellation!</span>
                </div>
              </div>

              <div className="payment-total-section">
                <div className="payment-total-row">
                  <span className="payment-total-label">Total</span>
                  <span className="payment-total-amount">{formatPrice(orderData.total)}</span>
                </div>
              </div>

              <div className="payment-actions">
                <Button 
                  className="payment-btn-order"
                  onClick={handleOrderAndPay}
                >
                  Order & Pay on-site
                </Button>
                <Button 
                  className="payment-btn-cancel"
                  onClick={handleCancel}
                >
                  Cancel & Back
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <footer className="homepage-footer">
        <p>
          Developed by <strong>HELD</strong>
        </p>
      </footer>
    </div>
  );
}
