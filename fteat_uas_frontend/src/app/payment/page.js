'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import HomeNavbar from '../components/HomeNavbar';
import ProtectedRoute from '../components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

// Vendor payment details - same bank account, different WhatsApp numbers
const vendorPaymentDetails = {
  'Kantin LupaNamanya': {
    bankAccount: 'BCA 1234567890 a/n Bpk. Asep',
    whatsapp: '081245678901',
    location: 'Kantin LupaNamanya'
  },
  'Kantin Teknik Bursa Lt.7': {
    bankAccount: 'BCA 1234567890 a/n Bpk. Asep',
    whatsapp: '081298765432',
    location: 'Kantin Teknik Bursa Lt.7'
  },
  'Stand B': {
    bankAccount: 'BCA 1234567890 a/n Bpk. Asep',
    whatsapp: '081298765432',
    location: 'Stand B'
  }
};

// Available additionals for instant noodles
const instantNoodleAdditionals = [
  { name: "Telur 1", price: 3000 },
  { name: "Telur 2", price: 5000 },
  { name: "Kornet", price: 5000 },
  { name: "Keju", price: 4000 },
  { name: "Bakso 3pcs", price: 6000 },
];

export default function PaymentPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState({});
  const [renderKey, setRenderKey] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedAdditionals, setSelectedAdditionals] = useState({});

  useEffect(() => {
    // Get cart data from localStorage
    const savedCart = localStorage.getItem('cart');
    const savedOrder = localStorage.getItem('currentOrder');
    
    if (savedCart) {
      const cartItems = JSON.parse(savedCart);
      // Group items by vendor
      const groupedByVendor = {};
      
      cartItems.forEach(item => {
        const vendor = item.vendorName || 'Kantin Lupa Namanya';
        if (!groupedByVendor[vendor]) {
          groupedByVendor[vendor] = {
            vendor: vendor,
            items: [],
            total: 0
          };
        }
        groupedByVendor[vendor].items.push({
          name: item.name,
          quantity: item.quantity || 1,
          price: item.totalPrice || item.price,
          image: item.image,
          toppings: item.selectedAdditionals?.map(a => `${a.name} (${a.quantity})`).join(', ') || ''
        });
        groupedByVendor[vendor].total += (item.totalPrice || item.price) * (item.quantity || 1);
      });
      
      setOrderData(groupedByVendor);
    } else if (savedOrder) {
      // Single order from Buy Now
      const order = JSON.parse(savedOrder);
      setOrderData({
        [order.vendor]: order
      });
    } else {
      // Sample data for demo
      setOrderData({
        'Kantin Teknik Bursa Lt.7': {
          vendor: 'Kantin Teknik Bursa Lt.7',
          items: [
            { 
              name: 'Mie Goreng Sakura', 
              quantity: 1, 
              price: 8000, 
              image: '/images/menus/indomie-goreng.jpg',
              toppings: 'Telur (2), Kornet'
            }
          ],
          total: 23000
        }
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

  const handleWhatsAppClick = (vendor) => {
    const vendorDetails = vendorPaymentDetails[vendor] || vendorPaymentDetails['Kantin Lupa Namanya'];
    const whatsappNumber = vendorDetails.whatsapp;
    const vendorOrder = orderData[vendor];
    const message = encodeURIComponent(
      `Halo, saya ingin konfirmasi pembayaran untuk pesanan:\n\n` +
      vendorOrder.items.map(item => `${item.name} x${item.quantity}`).join('\n') +
      `\n\nTotal: ${formatPrice(vendorOrder.total)}`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleEdit = (vendor, index) => {
    const item = orderData[vendor].items[index];
    setEditingItem({ vendor, index, item });
    
    // Parse current toppings into selectedAdditionals
    const currentAdditionals = {};
    if (item.toppings) {
      const toppingsList = item.toppings.split(',').map(t => t.trim());
      toppingsList.forEach(topping => {
        // Extract name and quantity from format like "Telur 1 (2)"
        const match = topping.match(/^(.+?)\s*\((\d+)\)$/);
        if (match) {
          const name = match[1].trim();
          const qty = parseInt(match[2]);
          currentAdditionals[name] = qty;
        }
      });
    }
    
    setSelectedAdditionals(currentAdditionals);
    setShowEditModal(true);
  };
  
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setSelectedAdditionals({});
  };
  
  const updateAdditionalQuantity = (additionalName, change) => {
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
  
  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    const { vendor, index, item } = editingItem;
    const newOrderData = { ...orderData };
    const vendorOrder = { ...newOrderData[vendor] };
    const newItems = [...vendorOrder.items];
    
    // Calculate additional price from selected toppings
    let additionalsPrice = 0;
    Object.entries(selectedAdditionals).forEach(([name, qty]) => {
      const additional = instantNoodleAdditionals.find(a => a.name === name);
      if (additional && qty > 0) {
        additionalsPrice += additional.price * qty;
      }
    });
    
    // Format toppings string
    const toppingsArray = Object.entries(selectedAdditionals)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => `${name} (${qty})`);
    const toppingsString = toppingsArray.join(', ');
    
    // Get base price (original menu price without previous additionals)
    // Assuming base price is stored or we can extract it
    const basePrice = item.basePrice || 8000; // Default to 8000 for instant noodles
    const newPrice = basePrice + additionalsPrice;
    
    newItems[index] = { 
      ...newItems[index], 
      toppings: toppingsString,
      price: newPrice,
      basePrice: basePrice // Store base price for future edits
    };
    
    // Recalculate vendor total
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    vendorOrder.items = newItems;
    vendorOrder.total = newTotal;
    newOrderData[vendor] = vendorOrder;
    setOrderData(newOrderData);
    
    // Update localStorage
    localStorage.setItem('currentOrder', JSON.stringify(newOrderData));
    updateCartInLocalStorage(newOrderData);
    
    // Force re-render
    setRenderKey(prev => prev + 1);
    
    handleCloseModal();
  };
  
  const isFromKantinBursa = (vendorName) => {
    return vendorName === 'Kantin Teknik Bursa Lt.7';
  };

  const updateQuantity = (vendor, index, change) => {
    const newOrderData = { ...orderData };
    const vendorOrder = { ...newOrderData[vendor] };
    const newItems = [...vendorOrder.items];
    const currentQty = newItems[index].quantity;
    const newQty = currentQty + change;
    
    // If quantity becomes 0 or less, remove the item
    if (newQty <= 0) {
      if (confirm('Remove this item from your order?')) {
        newItems.splice(index, 1);
        
        // If no items left for this vendor, remove the vendor
        if (newItems.length === 0) {
          delete newOrderData[vendor];
          
          // Update localStorage
          if (Object.keys(newOrderData).length === 0) {
            localStorage.removeItem('currentOrder');
            localStorage.removeItem('cart');
            setOrderData({});
          } else {
            localStorage.setItem('currentOrder', JSON.stringify(newOrderData));
            // Update cart as well
            updateCartInLocalStorage(newOrderData);
            setOrderData(newOrderData);
          }
          
          // Force re-render
          setRenderKey(prev => prev + 1);
          
          // Dispatch cart update event
          window.dispatchEvent(new Event('cartUpdated'));
          return;
        }
      } else {
        return; // User cancelled deletion
      }
    } else {
      newItems[index].quantity = newQty;
    }
    
    const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    vendorOrder.items = newItems;
    vendorOrder.total = newTotal;
    newOrderData[vendor] = vendorOrder;
    
    // Update localStorage
    localStorage.setItem('currentOrder', JSON.stringify(newOrderData));
    // Update cart as well
    updateCartInLocalStorage(newOrderData);
    
    // Update state
    setOrderData(newOrderData);
    setRenderKey(prev => prev + 1);
    
    // Dispatch cart update event
    window.dispatchEvent(new Event('cartUpdated'));
  };
  
  const updateCartInLocalStorage = (orderData) => {
    // Convert orderData back to cart format
    const cartItems = [];
    Object.keys(orderData).forEach(vendor => {
      orderData[vendor].items.forEach(item => {
        cartItems.push({
          ...item,
          vendorName: vendor
        });
      });
    });
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  return (
    <ProtectedRoute>
      <div className="payment-page">
        <HomeNavbar />
        
        <div className="payment-container">
          <h1 className="payment-main-title">Payment</h1>
          
          <div className="payment-layout">
            {/* Left Section - Fixed */}
            <div className="payment-left-section">
              <div className="payment-instructions">
                <h2 className="payment-instructions-title">Tata Cara Pembayaran</h2>
                
                <div className="payment-step">
                  <div className="payment-step-number">1</div>
                  <div className="payment-step-content">
                    <p className="payment-step-text">Setiap vendor memiliki rekening pembayaran dan nomor WhatsApp yang berbeda.</p>
                  </div>
                </div>

                <div className="payment-step">
                  <div className="payment-step-number">2</div>
                  <div className="payment-step-content">
                    <p className="payment-step-text">Lakukan transfer ke nomor rekening yang tertera, dan kirim bukti pembayaran melalui WhatsApp vendor terkait.</p>
                  </div>
                </div>

                <div className="payment-step">
                  <div className="payment-step-number">3</div>
                  <div className="payment-step-content">
                    <p className="payment-step-text">Setelah vendor memverifikasi pembayaran Anda, pesanan akan muncul di halaman &quot;History Order&quot;.</p>
                  </div>
                </div>

                <div className="payment-step">
                  <div className="payment-step-number">4</div>
                  <div className="payment-step-content">
                    <p className="payment-step-text">Pesanan Anda siap diambil.</p>
                  </div>
                </div>

                <div className="payment-step">
                  <div className="payment-step-number">5</div>
                  <div className="payment-step-content">
                    <p className="payment-step-text">Pesanan Anda siap diambil.</p>
                  </div>
                </div>

                <div className="payment-step">
                  <div className="payment-step-number">6</div>
                  <div className="payment-step-content">
                    <p className="payment-step-text">Pesanan Anda siap diambil.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Scrollable */}
            <div className="payment-right-section" key={renderKey}>
              <div className="payment-order-details">
                {Object.keys(orderData).length > 0 ? Object.keys(orderData).map((vendorName) => {
                  const vendorOrder = orderData[vendorName];
                  // Get vendor details with proper fallback
                  let vendorDetails = vendorPaymentDetails[vendorName];
                  
                  // If vendor not found, create default details
                  if (!vendorDetails) {
                    vendorDetails = {
                      bankAccount: 'BCA 1234567890 a/n Bpk. Asep',
                      whatsapp: '081245678901',
                      location: vendorName
                    };
                  }
                  
                  return (
                    <div key={vendorName} className="payment-vendor-section">
                      {/* Vendor Header */}
                      <div className="payment-vendor-header">
                        <h2 className="payment-vendor-name">{vendorName}</h2>
                      </div>

                      {/* Vendor Items */}
                      {vendorOrder.items && vendorOrder.items.map((item, index) => (
                  <div key={index} className="payment-order-card">
                    <div className="payment-order-header">
                      <span className="payment-order-location">{vendorDetails.location}</span>
                    </div>
                    
                    <div className="payment-order-content">
                      <div className="payment-order-image">
                        <Image 
                          src={item.image || '/images/logo.png'}
                          alt={item.name}
                          width={100}
                          height={100}
                          unoptimized
                        />
                      </div>
                      
                      <div className="payment-order-info">
                        <h3 className="payment-order-name">{item.name}</h3>
                        {item.toppings && (
                          <p className="payment-order-toppings">Topping: {item.toppings}</p>
                        )}
                        <p className="payment-order-price">{formatPrice(item.price)}</p>
                      </div>
                    </div>

                    <div className="payment-order-actions">
                      {isFromKantinBursa(vendorName) && (
                        <button 
                          className="payment-edit-btn"
                          onClick={() => handleEdit(vendorName, index)}
                        >
                          ✏️ Edit
                        </button>
                      )}
                      
                      <div className="payment-quantity-controls">
                        <button 
                          className="payment-qty-btn"
                          onClick={() => updateQuantity(vendorName, index, 1)}
                        >
                          +
                        </button>
                        <span className="payment-qty-display">{item.quantity}</span>
                        <button 
                          className="payment-qty-btn"
                          onClick={() => updateQuantity(vendorName, index, -1)}
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Section for this vendor */}
                <div className="payment-total-card">
                  <div className="payment-total-row">
                    <span className="payment-total-label">Total Pembayaran {vendorName}:</span>
                    <span className="payment-total-amount">{formatPrice(vendorOrder.total)}</span>
                  </div>
                </div>

                {/* Bank Transfer Section for this vendor */}
                <div className="payment-bank-card">
                  <div className="payment-bank-icon">🏦</div>
                  <div className="payment-bank-info">
                    <p className="payment-bank-label">Transfer ke:</p>
                    <p className="payment-bank-account">{vendorDetails.bankAccount}</p>
                  </div>
                </div>

                {/* WhatsApp Section for this vendor */}
                <div 
                  className="payment-whatsapp-card"
                  onClick={() => handleWhatsAppClick(vendorName)}
                >
                  <div className="payment-whatsapp-icon">
                    💬
                  </div>
                  <div className="payment-whatsapp-info">
                    <p className="payment-whatsapp-label">Kirim bukti pembayaran ke:</p>
                    <p className="payment-whatsapp-number">{vendorDetails.whatsapp}</p>
                  </div>
                </div>
                    </div>
                  );
                }) : (
                  <div className="payment-empty-state">
                    <p>Tidak ada pesanan. Silakan tambahkan item ke keranjang terlebih dahulu.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="payment-footer">
          <p>Developed by <strong>HELD</strong></p>
        </footer>

        {/* Edit Toppings Modal */}
        <Modal show={showEditModal} onHide={handleCloseModal} centered className="additionals-modal">
          <Modal.Header closeButton className="additionals-modal-header">
            <Modal.Title className="additionals-modal-title">
              {editingItem?.item?.name || 'Edit Toppings'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="additionals-modal-body">
            <h6 className="additionals-subtitle">Pilih Tambahan (Optional)</h6>
            <ListGroup className="additionals-list">
              {instantNoodleAdditionals.map((additional, idx) => {
                const quantity = selectedAdditionals[additional.name] || 0;
                return (
                  <ListGroup.Item 
                    key={idx}
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
                        onClick={() => updateAdditionalQuantity(additional.name, -1)}
                        disabled={quantity === 0}
                      >
                        -
                      </Button>
                      <span className="qty-display">{quantity}</span>
                      <Button 
                        variant="outline-primary"
                        size="sm"
                        className="qty-btn qty-plus"
                        onClick={() => updateAdditionalQuantity(additional.name, 1)}
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
                {Object.entries(selectedAdditionals)
                  .filter(([_, qty]) => qty > 0)
                  .map(([name, qty], idx) => {
                    const additional = instantNoodleAdditionals.find(a => a.name === name);
                    return (
                      <div key={idx} className="summary-item">
                        <span>{name} x{qty}</span>
                        <span>{formatPrice((additional?.price || 0) * qty)}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="additionals-modal-footer">
            <Button variant="secondary" onClick={handleCloseModal} className="modal-btn-cancel">
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveEdit} className="modal-btn-buy">
              Simpan
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
