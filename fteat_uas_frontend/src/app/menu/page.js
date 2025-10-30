'use client';
import { useState } from 'react';
import { Container, Row, Col, Form, Card, Button, Badge } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HomeNavbar from '../components/HomeNavbar';
import MenuCard from '../components/MenuCard';
import { mockMenus, mockCategories } from '../../utils/mockData';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

export default function MenuPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [cart, setCart] = useState([]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const filteredMenus = mockMenus.filter(menu => {
    // Enhanced search: search in name, description, category, and vendor name
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
                         menu.name.toLowerCase().includes(searchLower) ||
                         menu.description.toLowerCase().includes(searchLower) ||
                         menu.category.toLowerCase().includes(searchLower) ||
                         menu.vendorName.toLowerCase().includes(searchLower);
    
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes(menu.category);
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (menuWithAdditionals) => {
    setCart(prev => [...prev, { ...menuWithAdditionals, quantity: 1 }]);
    alert(`${menuWithAdditionals.name} ditambahkan ke keranjang!`);
  };

  const handleBuyNow = (menuWithAdditionals) => {
    // Store the order temporarily
    localStorage.setItem('tempOrder', JSON.stringify([{ ...menuWithAdditionals, quantity: 1 }]));
    router.push('/order');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
  };

  return (
    <div className="menu-page">
      {/* Navbar with Title on Right */}
      <div className="page-navbar">
        <HomeNavbar />
        <div className="page-title-section">
          <h1 className="page-title">Menu</h1>
          <Image 
            src="/images/icon_small.png" 
            alt="FTEAT Logo" 
            width={60}
            height={60}
            className="page-logo-icon"
            unoptimized
          />
        </div>
      </div>

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
            {filteredMenus.length > 0 ? (
              <Row className="menu-grid">
                {filteredMenus.map(menu => (
                  <Col key={menu.id} xl={4} lg={6} md={12} className="mb-4">
                    <MenuCard 
                      menu={menu}
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
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
