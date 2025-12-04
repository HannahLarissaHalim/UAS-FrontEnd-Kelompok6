'use client';
import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Card, Button, Badge } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import MenuCard from '../components/MenuCard';
import ErrorPage from '../components/ErrorPage';

import { mockCategories } from '../../utils/mockData'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

export default function MenuPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [cart, setCart] = useState([]);

  const [menus, setMenus] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [apiError, setApiError] = useState(null); 

  // Fungsi untuk mengambil data dari API Express 
  const fetchMenus = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    
    try {
      // Use environment variable for API URL
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Fetching menus from:', API_URL);
      
      const response = await fetch(`${API_URL}/api/menus`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API responded with error status:', response.status, errorText);
        setApiError({
          code: response.status,
          message: response.status === 404 ? 'API Not Found' : 'Server Error',
          details: `Failed to fetch menus. Status: ${response.status}`
        });
        throw new Error('Gagal mengambil data menu dari server');
      }
      
      const result = await response.json();
      const menuData = result.data || [];
      
      console.log('Menus fetched successfully:', menuData.length, 'items');
      setMenus(menuData);

    } catch (error) {
      console.error('Fetch error:', error);
      if (!apiError) {
        setApiError({
          code: 'ERR_CONNECTION',
          message: 'Cannot Reach Server',
          details: 'Unable to connect to the API server. Please check if the server is running.'
        });
      }
      setMenus([]); 
    } finally {
      setLoading(false);
    }
  }, [apiError]);

  // Effect 1: Load data menu saat komponen dimount
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]); 
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const filteredMenus = menus.filter(menu => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
                          menu.name.toLowerCase().includes(searchLower) ||
                          (menu.brand?.toLowerCase().includes(searchLower)) || 
                          menu.category.toLowerCase().includes(searchLower) ||
                          menu.vendor?.toLowerCase().includes(searchLower); 
    
    const matchesCategory = selectedCategories.length === 0 || 
                            selectedCategories.includes(menu.category);
    return matchesSearch && matchesCategory;
  });

  // DEBUG LOG
  useEffect(() => {
    if (!loading) {
      console.log(`Total Menu dari DB: ${menus.length}`);
      console.log(`Total Menu setelah Filter: ${filteredMenus.length}`);
    }
  }, [loading, menus.length, filteredMenus.length]); 

  const handleAddToCart = (menuWithAdditionals) => {
    // Ensure vendor identifier is preserved on cart items
    const vendorId = menuWithAdditionals.vendor || menuWithAdditionals.VendorID || menuWithAdditionals.vendorId || menuWithAdditionals.vendorName || '';
    const vendorName = menuWithAdditionals.vendorName || menuWithAdditionals.stallName || menuWithAdditionals.vendor || '';
    const cartItem = {
      ...menuWithAdditionals,
      quantity: 1,
      vendorId: vendorId,
      vendorName: vendorName
    };
    const newCart = [...cart, cartItem];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleBuyNow = (menuWithAdditionals) => {
    const orderData = {
      vendor: menuWithAdditionals.vendor || 'Kantin Lupa Namanya', 
      items: [{
        _id: menuWithAdditionals._id || menuWithAdditionals.id,
        menuItem: menuWithAdditionals._id || menuWithAdditionals.id,
        name: menuWithAdditionals.name,
        category: menuWithAdditionals.category,
        quantity: 1,
        price: menuWithAdditionals.totalPrice || menuWithAdditionals.price,
        basePrice: menuWithAdditionals.price, 
        image: menuWithAdditionals.image,
        toppings: menuWithAdditionals.selectedAdditionals?.map(a => `${a.name} (${a.quantity})`).join(', ') || '',
        vendorId: menuWithAdditionals.vendor || menuWithAdditionals.vendorId || '',
        vendorName: menuWithAdditionals.vendor || menuWithAdditionals.vendorName || ''
      }],
      total: menuWithAdditionals.totalPrice || menuWithAdditionals.price
    };
    localStorage.setItem('currentOrder', JSON.stringify(orderData));
    router.push('/payment');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
  };

  // Show error page if API error
  if (apiError) {
    return (
      <ErrorPage
        errorCode={apiError.code}
        errorMessage={apiError.message}
        errorDetails={apiError.details}
      />
    );
  }

  return (
    <div className="menu-page">
      <Navbar />

      <Container fluid className="menu-container">
        <Row>
          {/* Sidebar Filter */}
          <Col lg={3} md={4} className="mb-4">
            <div className="menu-sidebar">
              <div className="menu-filter-header">
                <h5>Menu Categories</h5>
                <span className="filter-icon">▼</span>
              </div>
              
              {/* Search Box */}
              <div className="menu-search-box">
                <span className="search-icon">🔍</span>
                <Form.Control
                  type="text"
                  placeholder="Search your favourite food!"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="menu-search-input"
                />
              </div>

              {/* Category Checkboxes */}
              <div className="menu-categories">
                {mockCategories.map(category => (
                  <Form.Check
                    key={category}
                    type="checkbox"
                    id={`category-${category}`}
                    label={category}
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="menu-category-checkbox"
                  />
                ))}
              </div>
            </div>
          </Col>

          {/* Menu Grid */}
          <Col lg={9} md={8}>
            {/* Tampilkan loading state */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4 className="mt-3" style={{ color: '#000' }}>Loading...</h4>
                </div>
            )}

            {/* Tampilkan menu jika tidak loading dan ada data */}
            {!loading && filteredMenus.length > 0 ? (
              <Row className="menu-grid">
                {filteredMenus.map(menu => (
                  <Col key={menu._id} xl={4} lg={6} md={12} className="mb-4">
                    <MenuCard 
                      menu={menu}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              // Tampilkan not found jika tidak loading dan menu kosong
              !loading && (
                <div className="text-center py-5">
                  <div style={{ fontSize: '4rem' }}>🔍</div>
                  <h4 className="mt-3">Menu tidak ditemukan</h4>
                  <p className="text-muted">
                    Coba ubah kata kunci pencarian atau filter kategori
                  </p>
                  <Button variant="primary" onClick={clearFilters}>
                    Reset Filter
                  </Button>
                </div>
              )
            )}
          </Col>
        </Row>
      </Container>
      
      {/* Footer */}
      <div className="homepage-footer">
        <p>Developed by <strong>HELD</strong></p>
      </div>

      {/* Mobile/Tablet Floating Cart Button */}
      {cart.length > 0 && (
        <div 
          className="mobile-floating-cart"
          onClick={() => router.push('/payment')}
        >
          <div className="floating-cart-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="floating-cart-badge">{cart.length}</span>
          </div>
          <div className="floating-cart-info">
            <span className="floating-cart-text">Keranjang</span>
            <span className="floating-cart-total">
              Rp {cart.reduce((sum, item) => sum + (item.totalPrice || item.price), 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="floating-cart-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}