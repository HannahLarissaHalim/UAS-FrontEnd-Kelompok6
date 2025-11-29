'use client';
import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Card, Button, Badge } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import MenuCard from '../components/MenuCard';

import { mockCategories } from '../../utils/mockData'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import '/menu.css';

export default function MenuPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [cart, setCart] = useState([]);

  const [menus, setMenus] = useState([]); 
  const [loading, setLoading] = useState(true); 

  // Fungsi untuk mengambil data dari API Express (http://localhost:5000)
  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      // ⚠️ PERBAIKAN UTAMA: Menggunakan URL ABSOLUT ke server Express
      const response = await fetch('http://localhost:5000/api/menus'); 
      
      if (!response.ok) {
        // Log error respons dari server jika status bukan 200
        const errorText = await response.text();
        console.error('API responded with error status:', response.status, errorText);
        throw new Error('Gagal mengambil data menu dari server');
      }
      
      const result = await response.json();
      
      setMenus(result.data || []); 

    } catch (error) {
      console.error('Fetch error:', error);
      // Opsional: set menus ke array kosong jika fetch gagal
      setMenus([]); 
    } finally {
      setLoading(false);
    }
  }, []);

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
        name: menuWithAdditionals.name,
        category: menuWithAdditionals.category,
        quantity: 1,
        price: menuWithAdditionals.totalPrice || menuWithAdditionals.price,
        basePrice: menuWithAdditionals.price, 
        image: menuWithAdditionals.image,
        toppings: menuWithAdditionals.selectedAdditionals?.map(a => `${a.name} (${a.quantity})`).join(', ') || ''
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
                    <h4 className="mt-3">Memuat menu...</h4>
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
    </div>
  );
}