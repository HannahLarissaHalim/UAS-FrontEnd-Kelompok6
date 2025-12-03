'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import api from '../../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';
import "./payment.css";

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

// Normalize WhatsApp number to international format required by wa.me
// Example: "0895600740915" -> "62895600740915"
const normalizeWhatsappNumber = (rawNumber) => {
  if (!rawNumber) return '';
  // Keep only digits
  let digits = String(rawNumber).replace(/\D/g, '');

  // If already starts with country code 62, keep as is
  if (digits.startsWith('62')) return digits;

  // If starts with 0 (Indonesian local format), replace leading 0 with 62
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }

  // Fallback: return digits as-is
  return digits;
};

export default function PaymentPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState({});
  const [vendorInfoMap, setVendorInfoMap] = useState({});
  const [vendorsLoaded, setVendorsLoaded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedAdditionals, setSelectedAdditionals] = useState({});

  useEffect(() => {
    async function loadCartAndVendors() {
      // Load vendors FIRST
      let vendorMap = {};
      try {
        console.log('Fetching vendors...');
        const vendorsRes = await api.getVendors();
        console.log('Vendors API raw response:', vendorsRes);
        
        // Handle both {data: [...]} and direct array response
        const vendorsList = vendorsRes?.data || vendorsRes || [];
        console.log('Vendors list:', vendorsList);
        
        if (Array.isArray(vendorsList) && vendorsList.length > 0) {
          vendorsList.forEach(v => {
            const vendorId = (v.VendorId || v.vendorId || '').toString();
            const mongoId = (v._id || '').toString();
            const stallName = v.stallName || '';
            
            // Store vendor by all possible keys
            if (vendorId) vendorMap[vendorId] = v;
            if (mongoId) vendorMap[mongoId] = v;
            if (stallName) vendorMap[stallName] = v;
            if (vendorId) vendorMap[vendorId.toLowerCase()] = v;
            if (stallName) vendorMap[stallName.toLowerCase()] = v;
            
            console.log('Mapped vendor:', { vendorId, stallName, whatsapp: v.whatsapp, bankName: v.bankName, accountNumber: v.accountNumber, accountHolder: v.accountHolder });
          });
          console.log('VendorMap keys:', Object.keys(vendorMap));
        } else {
          console.warn('No vendors returned from API');
        }
      } catch (err) {
        console.error('Failed to load vendor info:', err);
      }
      
      setVendorInfoMap(vendorMap);
      setVendorsLoaded(true);

      // Then load cart
      const savedCart = localStorage.getItem('cart');
      const savedOrder = localStorage.getItem('currentOrder');

      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        console.log('Cart items:', cartItems);
        const groupedByVendor = {};

        cartItems.forEach(item => {
          const vendor = item.vendorName || item.vendor || 'Kantin Lupa Namanya';
          const vendorId = item.vendorId || item.vendor || item.vendorName || '';
          console.log('Cart item vendor info:', { vendor, vendorId });
          if (!groupedByVendor[vendor]) groupedByVendor[vendor] = { vendor, vendorId, items: [], total: 0 };

          // Preserve the menu item ID for order creation
          const menuItemId = item._id || item.id || item.menuItem || item.menuId || null;
          console.log('Grouping cart item:', { name: item.name, _id: item._id, id: item.id, menuItem: item.menuItem, resolved: menuItemId });
          
          groupedByVendor[vendor].items.push({
            menuItem: menuItemId,
            _id: menuItemId, // Keep _id as backup
            name: item.name,
            quantity: item.quantity || 1,
            price: item.totalPrice || item.price,
            image: item.image,
            toppings: item.selectedAdditionals?.map(a => `${a.name} (${a.quantity})`).join(', ') || ''
          });

          groupedByVendor[vendor].total += (item.totalPrice || item.price) * (item.quantity || 1);
        });

        setOrderData(groupedByVendor);
        return;
      }

      if (savedOrder) {
        const order = JSON.parse(savedOrder);
        setOrderData({ [order.vendor]: order });
        return;
      }

      // sample fallback
      setOrderData({
        'Kantin Teknik Bursa Lt.7': {
          vendor: 'Kantin Teknik Bursa Lt.7',
          items: [
            { name: 'Mie Goreng Sakura', quantity: 1, price: 8000, image: '/images/menus/indomie-goreng.jpg', toppings: 'Telur (2), Kornet' }
          ],
          total: 23000
        }
      });
    }

    loadCartAndVendors();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // show policy modal before sending proof/creating order
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyVendor, setPolicyVendor] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const openPolicyForVendor = (vendor) => {
    setPolicyVendor(vendor);
    setShowPolicyModal(true);
  };

  const handleWhatsAppClick = (vendor) => {
    // open policy modal for this vendor
    openPolicyForVendor(vendor);
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
          vendorName: vendor,
          vendorId: orderData[vendor].vendorId || ''
        });
      });
    });
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  // Create order for the selected vendor after user agrees to policy
  const confirmAndCreateOrder = async () => {
    if (!policyVendor) return;
    const vendorGroup = orderData[policyVendor];
    if (!vendorGroup) return;

    try {
      setCreatingOrder(true);
      const token = localStorage.getItem('token');

      // Build order payload expected by backend
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = localUser.userId || localUser._id || localUser.id || null;

      // Debug: log items to see what IDs are available
      console.log('Creating order for items:', vendorGroup.items);
      
      const itemsPayload = (vendorGroup.items || []).map(i => {
        // Try multiple possible ID fields
        const menuItemId = i.menuItem || i._id || i.id || i.menuId || null;
        console.log('Item ID resolution:', { name: i.name, menuItem: i.menuItem, _id: i._id, id: i.id, resolved: menuItemId });
        return {
          menuItem: menuItemId,
          quantity: i.quantity || 1,
          selectedAddOns: []
        };
      });

      const payload = {
        user: userId,
        vendor: vendorGroup.vendorId || policyVendor,
        items: itemsPayload,
        totalPrice: vendorGroup.total,
        paymentMethod: 'transfer',
        pickupLocation: policyVendor,
        paymentStatus: 'unpaid'
      };

      const res = await api.createOrder(payload, token);
      if (!res?.success) {
        alert('Gagal membuat pesanan: ' + (res?.message || 'Unknown'));
        return;
      }

      // Remove this vendor from currentOrder and update cart
      const newOrderData = { ...orderData };
      delete newOrderData[policyVendor];
      setOrderData(newOrderData);
      if (Object.keys(newOrderData).length === 0) {
        localStorage.removeItem('currentOrder');
        localStorage.removeItem('cart');
      } else {
        localStorage.setItem('currentOrder', JSON.stringify(newOrderData));
        updateCartInLocalStorage(newOrderData);
      }

      // open WhatsApp to vendor for sending proof
      const vendorObj = vendorInfoMap[vendorGroup.vendorId] || vendorInfoMap[policyVendor];
      const vendorDetails = vendorObj ? { whatsapp: vendorObj.whatsapp || '081245678901' } : (vendorPaymentDetails[policyVendor] || vendorPaymentDetails['Kantin Lupa Namanya']);
      const whatsappNumber = normalizeWhatsappNumber(vendorDetails.whatsapp);
      const message = encodeURIComponent(
        `Halo, saya ingin konfirmasi pembayaran untuk pesanan:\n\n` +
        vendorGroup.items.map(item => `${item.name} x${item.quantity}`).join('\n') +
        `\n\nTotal: ${formatPrice(vendorGroup.total)}`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');

      // notify cart updated
      window.dispatchEvent(new Event('cartUpdated'));
      alert('Pesanan berhasil dibuat dan pemberitahuan dikirim ke vendor.');
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Terjadi kesalahan saat membuat pesanan');
    } finally {
      setCreatingOrder(false);
      setShowPolicyModal(false);
      setPolicyVendor(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="payment-page">
        <Navbar />
        
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
                    <p className="payment-step-text">Pastikan pesanan yang Anda pilih sudah benar sebelum menekan tombol &quot;Buat Pesanan&quot;.</p>
                  </div>
                </div>

                <div className="payment-step">
                  <div className="payment-step-number">2</div>
                  <div className="payment-step-content">
                    <p className="payment-step-text">Setiap vendor memiliki rekening pembayaran dan nomor WhatsApp yang berbeda.</p>
                  </div>
                </div>

                <div className="payment-step">
                  <div className="payment-step-number">3</div>
                  <div className="payment-step-content">
                    <p className="payment-step-text">Anda akan menerima instruksi pembayaran per vendor sesuai dengan daftar pesanan Anda.</p>
                  </div>
                </div>

                <div className="payment-step">
                  <div className="payment-step-number">4</div>
                  <div className="payment-step-content">
                    <p className="payment-step-text">Lakukan transfer ke nomor rekening yang tertera, dan kirim bukti pembayaran melalui WhatsApp vendor terkait.</p>
                  </div>
                </div>

                <div className="payment-step">
                  <div className="payment-step-number">5</div>
                  <div className="payment-step-content">
                    <p className="payment-step-text">Setelah vendor memverifikasi pembayaran Anda, pesanan akan muncul di halaman &quot;History Order&quot;.</p>
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
                  
                  // Try multiple lookup strategies
                  const lookupKeys = [
                    vendorOrder.vendorId,
                    vendorName,
                    vendorName.toLowerCase(),
                    vendorOrder.vendorId?.toLowerCase()
                  ].filter(Boolean);
                  
                  let vendorObj = null;
                  for (const key of lookupKeys) {
                    if (vendorInfoMap[key]) {
                      vendorObj = vendorInfoMap[key];
                      break;
                    }
                  }
                  
                  console.log('Vendor lookup:', { 
                    vendorName, 
                    vendorId: vendorOrder.vendorId, 
                    lookupKeys,
                    found: !!vendorObj,
                    vendorObj: vendorObj ? { whatsapp: vendorObj.whatsapp, bankName: vendorObj.bankName } : null
                  });
                  
                  let vendorDetails;
                  if (vendorObj) {
                    const bankAccount = `${vendorObj.bankName || ''} ${vendorObj.accountNumber || ''}`.trim();
                    const accountHolder = vendorObj.accountHolder || vendorObj.accountHolderName || '';
                    vendorDetails = {
                      bankAccount: bankAccount ? `${bankAccount} a/n ${accountHolder}` : 'BCA 1234567890 a/n Bpk. Asep',
                      whatsapp: vendorObj.whatsapp || '081245678901',
                      location: vendorObj.stallName || vendorName
                    };
                    console.log('Using REAL vendor details:', vendorDetails);
                  } else {
                    vendorDetails = vendorPaymentDetails[vendorName] || { bankAccount: 'BCA 1234567890 a/n Bpk. Asep', whatsapp: '081245678901', location: vendorName };
                    console.log('FALLBACK to dummy details:', vendorDetails);
                  }
                  
                  return (
                    <div key={vendorName} className="payment-vendor-section">
                      
                      {/* Vendor Header
                      <div className="payment-vendor-header">
                        <h2 className="payment-vendor-name">{vendorName}</h2>
                      </div> */}

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
                    <span className="payment-total-label">Total Pembayaran:</span>
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

        {/* Payment Policy Modal shown before sending proof */}
        <Modal show={showPolicyModal} onHide={() => setShowPolicyModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Konfirmasi Pembayaran & Kebijakan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Dengan menekan <strong>Setuju</strong>, Anda menyatakan bahwa:</p>
            <ul>
              <li>Anda telah melakukan transfer sesuai nominal ke rekening yang tertera.</li>
              <li>Anda akan mengirim bukti pembayaran melalui WhatsApp kepada vendor.</li>
              <li>Semua informasi pembayaran yang diberikan adalah benar dan dapat diverifikasi.</li>
              <li>Vendor berhak menolak atau meminta bukti tambahan jika verifikasi tidak sesuai.</li>
            </ul>
            <p className="small text-muted">Kami sarankan menyimpan bukti transfer hingga pesanan dikonfirmasi.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPolicyModal(false)}>Batal</Button>
            <Button variant="success" onClick={confirmAndCreateOrder} disabled={creatingOrder}>{creatingOrder ? 'Memproses...' : 'Setuju'}</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
