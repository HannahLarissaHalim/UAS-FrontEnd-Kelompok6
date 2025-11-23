'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container, Row, Col, Form, Modal, Button } from 'react-bootstrap';
import VendorNavbar from '../../components/VendorNavbar';
import { mockCategories } from '../../../utils/mockData';
import api from '../../../utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './vendor-menu.css';

export default function VendorMenuPage() {
  const router = useRouter();
  const [vendorData, setVendorData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddToppingModal, setShowAddToppingModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMenu, setNewMenu] = useState({
    name: '',
    category: '',
    brand: '',
    price: '',
    image: null,
    imagePreview: null,
    hasTopping: false,
    additionals: []
  });
  
  const [newTopping, setNewTopping] = useState({
    name: '',
    price: ''
  });

  // Available toppings for Kantin Bursa (Instant Noodles)
  const [availableToppings, setAvailableToppings] = useState([
    { name: "Telur 1", price: 3000 },
    { name: "Telur 2", price: 5000 },
    { name: "Kornet", price: 5000 },
    { name: "Keju", price: 4000 },
    { name: "Bakso 3pcs", price: 6000 },
  ]);

  // Menu items from database
  const [menuItems, setMenuItems] = useState([]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const filteredMenus = menuItems.filter(menu => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
                         menu.name.toLowerCase().includes(searchLower) ||
                         (menu.brand && menu.brand.toLowerCase().includes(searchLower)) ||
                         menu.category.toLowerCase().includes(searchLower);
    
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes(menu.category);
    return matchesSearch && matchesCategory;
  });

  // Load vendor data and menus
useEffect(() => {
  const loadVendorData = async () => {
    try {
      const user = localStorage.getItem('user');
      
      let userData;
      if (!user) {
        // Dummy data for testing - menggunakan vendor name saja
        userData = {
          vendorName: 'Kantin Teknik Bursa Lt.7',
          email: 'fteat_kantinbursalt7@gmail.com',
          role: 'vendor'
        };
        console.log('Using dummy vendor data:', userData);
      } else {
        userData = JSON.parse(user);
        console.log('Loaded user data from localStorage:', userData);
      }
      
      setVendorData(userData);
      
      // Load menus after vendor data is set
      const vendorIdToUse = userData.vendorId || userData.vendorName || 'Kantin Teknik Bursa Lt.7';
      console.log('Loading menus for vendor:', vendorIdToUse);
      
      await loadMenus(vendorIdToUse);
    } catch (error) {
      console.error('Error loading vendor data:', error);
    }
  };

  loadVendorData();
}, []);

  // Load menus from database
const loadMenus = async (vendorId) => {
  try {
    setLoading(true);
    
    const result = await api.getMenusByVendor(vendorId);
    
    if (result.success) {
      // Transform data to match frontend format
      const transformedMenus = result.data.map(menu => ({
        id: menu._id,
        name: menu.name,
        price: menu.price,
        brand: menu.brand || '',
        category: menu.category,
        time: menu.time || '5~10 mins',
        hasTopping: menu.hasTopping || false,
        additionals: menu.additionals || [],
        image: menu.image || '/images/menu-placeholder.png',
        stock: menu.statusKetersediaan === 'available' ? 'ada' : 'habis',
        vendor: menu.vendor || vendorData?.vendorName || 'Kantin Teknik Bursa Lt.7'
      }));
      
      setMenuItems(transformedMenus);
    } else {
      setMenuItems([]);
    }
  } catch (error) {
    console.error('Error loading menus:', error);
    setMenuItems([]);
  } finally {
    setLoading(false);
  }
};

  const handleAddMenu = () => {
    setShowAddModal(true);
  };

  const handleDeleteMenu = () => {
    if (deleteMode && selectedMenus.length > 0) {
      setShowDeleteConfirm(true);
    } else {
      setDeleteMode(!deleteMode);
      setSelectedMenus([]);
    }
  };

 const confirmDelete = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // remove from UI immediately
    const deletedMenuIds = selectedMenus;
    setMenuItems(prevItems => prevItems.filter(item => !deletedMenuIds.includes(item.id)));
    setSelectedMenus([]);
    setDeleteMode(false);
    setShowDeleteConfirm(false);
    
    // Then update backend
    const result = await api.deleteMultipleMenus(deletedMenuIds, token);
    
    if (!result.success) {
      // On failure, reload to get correct state
      await loadMenus(vendorData.vendorId || vendorData.vendorName);
      alert('Gagal menghapus menu: ' + result.message);
    }
  } catch (error) {
    console.error('Error deleting menus:', error);
    // On error, reload to get correct state
    await loadMenus(vendorData.vendorId || vendorData.vendorName);
    alert('Terjadi kesalahan saat menghapus menu');
  }
};

  const toggleMenuSelection = (menuId) => {
    setSelectedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleEditMenu = (menuId) => {
    const menuToEdit = menuItems.find(m => m.id === menuId);
    if (menuToEdit) {
      setEditingMenu({
        ...menuToEdit,
        imagePreview: menuToEdit.image,
        additionals: menuToEdit.additionals || []
      });
      setShowEditModal(true);
    }
  };

const handleSaveEditMenu = async () => {
  try {
    const token = localStorage.getItem('token');
    const updateData = {
      name: editingMenu.name,
      price: parseInt(editingMenu.price),
      brand: editingMenu.brand,
      category: editingMenu.category,
      image: editingMenu.imagePreview,
      hasTopping: editingMenu.additionals && editingMenu.additionals.length > 0,
      additionals: editingMenu.additionals || [],
      stock: editingMenu.stock
    };
    
    const result = await api.updateMenu(editingMenu.id, updateData, token);
    
    if (result.success) {
      // Update menu in state immediately
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item.id === editingMenu.id
            ? {
                ...item,
                name: editingMenu.name,
                price: parseInt(editingMenu.price),
                brand: editingMenu.brand,
                category: editingMenu.category,
                image: editingMenu.imagePreview || item.image,
                hasTopping: editingMenu.additionals && editingMenu.additionals.length > 0,
                additionals: editingMenu.additionals || [],
                stock: editingMenu.stock
              }
            : item
        )
      );
      
      // Close modal and reset
      setShowEditModal(false);
      setEditingMenu(null);
      
      alert('Menu berhasil diperbarui!');
    } else {
      alert('Gagal memperbarui menu: ' + result.message);
    }
  } catch (error) {
    console.error('Error updating menu:', error);
    alert('Terjadi kesalahan saat memperbarui menu');
  }
};

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingMenu({
          ...editingMenu,
          image: reader.result,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

 const handleToggleStock = async (menuId) => {
  try {
    const token = localStorage.getItem('token');
    const menu = menuItems.find(m => m.id === menuId);
    const newStock = menu.stock === 'ada' ? 'habis' : 'ada';
    
    // update UI immediately
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === menuId
          ? { ...item, stock: newStock }
          : item
      )
    );
    
    // Then update backend
    const result = await api.updateStockStatus(menuId, newStock, token);
    
    if (!result.success) {
      // Rollback on failure
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item.id === menuId
            ? { ...item, stock: menu.stock }
            : item
        )
      );
      alert('Gagal mengubah status stok: ' + result.message);
    }
  } catch (error) {
    console.error('Error updating stock status:', error);
    // Rollback on error
    const menu = menuItems.find(m => m.id === menuId);
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === menuId
          ? { ...item, stock: menu.stock }
          : item
      )
    );
    alert('Terjadi kesalahan saat mengubah status stok');
  }
};

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMenu({
          ...newMenu,
          image: reader.result,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectTopping = (toppingName) => {
    if (!toppingName) return;
    
    const topping = availableToppings.find(t => t.name === toppingName);
    if (topping && !newMenu.additionals.find(a => a.name === topping.name)) {
      setNewMenu({
        ...newMenu,
        additionals: [...newMenu.additionals, topping],
        hasTopping: true
      });
    }
  };

  const handleRemoveTopping = (index) => {
    const updatedAdditionals = newMenu.additionals.filter((_, i) => i !== index);
    setNewMenu({
      ...newMenu,
      additionals: updatedAdditionals,
      hasTopping: updatedAdditionals.length > 0
    });
  };

  const handleSaveNewTopping = () => {
    if (newTopping.name && newTopping.price) {
      const toppingToAdd = {
        name: newTopping.name,
        price: parseInt(newTopping.price)
      };
      
      // Add to available toppings list
      setAvailableToppings([...availableToppings, toppingToAdd]);
      
      // Add to current menu's additionals
      setNewMenu({
        ...newMenu,
        additionals: [...newMenu.additionals, toppingToAdd],
        hasTopping: true
      });
      
      // Reset and close modal
      setNewTopping({ name: '', price: '' });
      setShowAddToppingModal(false);
    }
  };

  const handleDeleteTopping = (toppingName) => {
    // Remove from available toppings list
    setAvailableToppings(availableToppings.filter(t => t.name !== toppingName));
    
    // Also remove from current menu's additionals if it exists
    setNewMenu({
      ...newMenu,
      additionals: newMenu.additionals.filter(t => t.name !== toppingName),
      hasTopping: newMenu.additionals.filter(t => t.name !== toppingName).length > 0
    });
  };

const handleSaveNewMenu = async () => {
  try {
    // Validasi input
    if (!newMenu.name || !newMenu.category || !newMenu.price) {
      alert('Mohon lengkapi nama menu, kategori, dan harga!');
      return;
    }

    const token = localStorage.getItem('token');
    const menuData = {
      name: newMenu.name,
      price: parseInt(newMenu.price),
      brand: newMenu.brand || '',
      category: newMenu.category,
      image: newMenu.imagePreview || '/images/icon_small.png',
      time: '5~10 mins',
      hasTopping: newMenu.hasTopping,
      additionals: newMenu.additionals || [],
      stock: 'ada',
      vendor: vendorData.vendorId || vendorData.vendorName || 'Kantin Teknik Bursa Lt.7',
      vendorName: vendorData.vendorName || 'Kantin Teknik Bursa Lt.7'
    };
    
    const result = await api.createMenu(menuData, token);
    
    if (result.success) {
      // Create new menu item from response (no need to reload from DB)
      const newMenuItem = {
        id: result.data._id,
        name: result.data.name,
        price: result.data.price,
        brand: result.data.brand || '',
        category: result.data.category,
        time: result.data.time || '5~10 mins',
        hasTopping: result.data.hasTopping || false,
        additionals: result.data.additionals || [],
        image: result.data.image || '/images/icon_small.png',
        stock: result.data.statusKetersediaan === 'available' ? 'ada' : 'habis',
        vendor: vendorData?.vendorName || 'Kantin Teknik Bursa Lt.7'
      };
      
      // Add to existing menu items immediately
      setMenuItems(prevItems => [newMenuItem, ...prevItems]);
      
      // Close modal and reset form
      setShowAddModal(false);
      setNewMenu({
        name: '',
        category: '',
        brand: '',
        price: '',
        image: null,
        imagePreview: null,
        hasTopping: false,
        additionals: []
      });
      setNewTopping({ name: '', price: '' });
      
      alert('Menu berhasil ditambahkan!');
    } else {
      alert('Gagal menambahkan menu: ' + result.message);
    }
  } catch (error) {
    console.error('Error creating menu:', error);
    alert('Terjadi kesalahan saat menambahkan menu: ' + error.message);
  }
};
  if (!vendorData) {
    return null;
  }

  if (loading) {
    return (
      <div className="vendor-menu-page">
        <VendorNavbar />
        <Container fluid className="menu-container">
          <div className="text-center mt-5">
            <p  className="text-dark">Memuat menu...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="vendor-menu-page">
      <VendorNavbar />

      <Container fluid className="menu-container">
        <Row>
          {/* Sidebar Filter */}
          <Col lg={3} md={4} className="mb-4">
            <div className="menu-sidebar">
              <div className="menu-filter-header">
                <h5>Menu Categories</h5>
                <span className="filter-icon">▼</span>
              </div>

              {/* Category Checkboxes */}
              <div className="menu-categories">
                {mockCategories.map(category => (
                  <Form.Check
                    key={category}
                    type="checkbox"
                    id={`vendor-category-${category}`}
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
            {/* Search and Action Buttons Row */}
            <div className="search-and-actions-row">
              {/* Search Box */}
              <div className="menu-search-box-top">
                <span className="search-icon">🔍</span>
                <Form.Control
                  type="text"
                  placeholder="Search your favourite food!"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="menu-search-input"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="action-buttons-section">
              <button className="add-menu-btn" onClick={handleAddMenu}>
                <svg width="31" height="31" viewBox="0 0 31 31" fill="none">
                  <circle cx="15.5" cy="15.5" r="14" stroke="white" strokeWidth="2"/>
                  <path d="M15.5 8V23M8 15.5H23" stroke="white" strokeWidth="2"/>
                </svg>
                Tambah menu
              </button>
              <button className="delete-menu-btn" onClick={handleDeleteMenu}>
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                  <path d="M8.5 10.625H25.5M11.333 10.625V7.083C11.333 6.316 11.95 5.667 12.75 5.667H21.25C22.05 5.667 22.667 6.316 22.667 7.083V10.625M14.167 15.583V23.917M19.833 15.583V23.917M10.625 10.625H23.375L22.667 26.458C22.667 27.225 22.05 27.875 21.25 27.875H12.75C11.95 27.875 11.333 27.225 11.333 26.458L10.625 10.625Z" stroke="white" strokeWidth="2"/>
                </svg>
                Hapus menu
              </button>
              </div>
            </div>

            {/* Menu Cards Grid */}
            <Row className="menu-grid">
              {filteredMenus.map((item) => (
                <Col key={item.id} xl={4} lg={6} md={12} className="mb-4">
                  <div className="menu-card">
                    {/* Checkbox for delete mode */}
                    {deleteMode && (
                      <div className="menu-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedMenus.includes(item.id)}
                          onChange={() => toggleMenuSelection(item.id)}
                          className="delete-checkbox"
                        />
                      </div>
                    )}
                    
                    {/* Menu Image */}
                    <div className="menu-image">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={248}
                        height={172}
                        unoptimized
                      />
                    </div>

                    {/* Menu Info */}
                    <div className="menu-info">
                      <div className="menu-tags">
                        {item.brand && <span className="brand-tag">{item.brand}</span>}
                        <span className="time-tag">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="6" cy="6" r="5" stroke="#27086E" strokeWidth="1"/>
                            <path d="M6 3V6L8 8" stroke="#27086E" strokeWidth="1"/>
                          </svg>
                          {item.time}
                        </span>
                        {item.hasTopping && <span className="topping-tag">+ Topping</span>}
                      </div>

                      <div className="menu-details">
                        <h4 className="menu-name">{item.name}</h4>
                        <div className="price-section">
                          <span className="price-label">Harga</span>
                          <span className="menu-price">Rp. {item.price.toLocaleString('id-ID')},-</span>
                        </div>
                      </div>

                      <div className="menu-actions">
                        <button 
                          className="edit-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMenu(item.id);
                          }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M3 21L4.5 15L15 4.5L19.5 9L9 19.5L3 21Z" stroke="white" strokeWidth="2"/>
                            <path d="M13.5 6L18 10.5" stroke="white" strokeWidth="2"/>
                          </svg>
                          Edit
                        </button>
                        <button 
                          className={`stock-btn ${item.stock === 'ada' ? 'stock-available' : 'stock-out'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStock(item.id);
                          }}
                        >
                          <span className="stock-circle"></span>
                          {item.stock === 'ada' ? 'Ada' : 'Habis'}
                        </button>
                      </div>

                      <p className="vendor-label">{item.vendor}</p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <div className="stand-footer">
        <span className="stand-footer-text">Developed by </span>
        <span className="stand-footer-held">HELD</span>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered className="delete-confirm-modal">
        <Modal.Body className="delete-modal-body">
          <p className="delete-confirm-text">
            Anda yakin untuk hapus {selectedMenus.length} menu?
          </p>
          <div className="delete-modal-buttons">
            <button className="delete-no-btn" onClick={() => setShowDeleteConfirm(false)}>
              Tidak
            </button>
            <button className="delete-yes-btn" onClick={confirmDelete}>
              Iya
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Add Menu Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg" className="add-menu-modal">
        <Modal.Body className="add-modal-body">
          <div className="add-menu-form">
            <div className="form-group">
              <label>Nama makanan</label>
              <input
                type="text"
                value={newMenu.name}
                onChange={(e) => setNewMenu({...newMenu, name: e.target.value})}
                placeholder="Korean Spicy Chicken"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gambar/Foto Makanan</label>
                <div className="image-upload" onClick={() => document.getElementById('imageInput').click()}>
                  {newMenu.imagePreview ? (
                    <img src={newMenu.imagePreview} alt="Preview" className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <svg width="95" height="95" viewBox="0 0 95 95" fill="none">
                        <path d="M20 75V25C20 21.6863 22.6863 19 26 19H69C72.3137 19 75 21.6863 75 25V75" stroke="#27086E" strokeWidth="2"/>
                        <circle cx="47.5" cy="47.5" r="15" stroke="#27086E" strokeWidth="2"/>
                        <path d="M47.5 40V55M40 47.5H55" stroke="#FFFFFF" strokeWidth="2"/>
                      </svg>
                    </div>
                  )}
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Kategori</label>
                <select
                  value={newMenu.category}
                  onChange={(e) => setNewMenu({...newMenu, category: e.target.value})}
                  className="form-select"
                >
                  <option value="">Kategori</option>
                  {mockCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <label className="mt-3">Merek</label>
                <input
                  type="text"
                  value={newMenu.brand}
                  onChange={(e) => setNewMenu({...newMenu, brand: e.target.value})}
                  placeholder='Merek : "Indomie"'
                  className="form-input"
                />

              </div>
            </div>

            <div className="form-group">
              <label>Harga</label>
              <input
                type="text"
                value={newMenu.price}
                onChange={(e) => setNewMenu({...newMenu, price: e.target.value})}
                placeholder="Rp. 10.000,-"
                className="form-input"
              />
            </div>

            {/* Topping/Additionals Section */}
            <div className="form-group">
              <label>Tambahan/Topping (Optional)</label>
              <p className="topping-note-top">Pilih topping yang tersedia untuk menu ini</p>
              
              {/* Topping Dropdown with Add Button */}
              <div className="topping-select-section">
                <select
                  onChange={(e) => {
                    handleSelectTopping(e.target.value);
                    e.target.value = ''; // Reset dropdown
                  }}
                  className="form-select topping-dropdown"
                >
                  <option value="">Pilih topping...</option>
                  {availableToppings.map((topping, idx) => (
                    <option key={idx} value={topping.name}>
                      {topping.name} - Rp. {topping.price.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
                <button 
                  type="button"
                  className="add-new-topping-btn" 
                  onClick={() => setShowAddToppingModal(true)}
                  title="Tambah topping baru"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="2"/>
                    <path d="M10 5V15M5 10H15" stroke="white" strokeWidth="2"/>
                  </svg>
                </button>
              </div>

              {/* Available Toppings Management */}
              {availableToppings.length > 0 && (
                <div className="available-toppings-section">
                  <p className="available-toppings-title">Topping yang tersedia:</p>
                  <div className="available-toppings-grid">
                    {availableToppings.map((topping, idx) => (
                      <div key={idx} className="available-topping-chip">
                        <span className="chip-text">{topping.name} - Rp. {topping.price.toLocaleString('id-ID')}</span>
                        <button 
                          type="button"
                          className="delete-chip-btn" 
                          onClick={() => handleDeleteTopping(topping.name)}
                          title="Hapus topping ini"
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 3L11 11M3 11L11 3" stroke="#FF4040" strokeWidth="2"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* List of Added Toppings */}
              {newMenu.additionals.length > 0 && (
                <div className="toppings-list">
                  <p className="toppings-list-title">Topping yang ditambahkan:</p>
                  {newMenu.additionals.map((topping, index) => (
                    <div key={index} className="topping-item">
                      <div className="topping-info">
                        <span className="topping-name">{topping.name}</span>
                        <span className="topping-price">Rp. {topping.price.toLocaleString('id-ID')},-</span>
                      </div>
                      <button 
                        type="button"
                        className="remove-topping-btn" 
                        onClick={() => handleRemoveTopping(index)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4L12 12M4 12L12 4" stroke="#FF4040" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="stock-toggle-section">
              <button 
                className={`stock-btn ${newMenu.stock === 'ada' ? 'stock-available' : 'stock-out'}`}
                onClick={() => setNewMenu({...newMenu, stock: newMenu.stock === 'ada' ? 'habis' : 'ada'})}
              >
                <span className="stock-circle"></span>
                Ada
              </button>
            </div>

            <button className="save-menu-btn" onClick={handleSaveNewMenu}>
              Simpan
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Add New Topping Modal */}
      <Modal show={showAddToppingModal} onHide={() => setShowAddToppingModal(false)} centered className="add-topping-modal">
        <Modal.Body className="add-topping-modal-body">
          <h5 className="add-topping-title">Tambah Topping Baru</h5>
          <div className="add-topping-form">
            <div className="form-group">
              <label>Nama Topping</label>
              <input
                type="text"
                value={newTopping.name}
                onChange={(e) => setNewTopping({...newTopping, name: e.target.value})}
                placeholder='e.g., "Sosis", "Macaroni"'
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Harga</label>
              <input
                type="text"
                value={newTopping.price}
                onChange={(e) => setNewTopping({...newTopping, price: e.target.value})}
                placeholder="e.g., 5000"
                className="form-input"
              />
            </div>
            <div className="add-topping-modal-buttons">
              <button className="cancel-topping-btn" onClick={() => {
                setNewTopping({ name: '', price: '' });
                setShowAddToppingModal(false);
              }}>
                Batal
              </button>
              <button className="save-topping-btn" onClick={handleSaveNewTopping}>
                Simpan
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Menu Modal */}
      {editingMenu && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg" className="add-menu-modal">
          <Modal.Body className="add-modal-body">
            <div className="add-menu-form">
              <div className="form-group">
                <label>Nama makanan</label>
                <input
                  type="text"
                  value={editingMenu.name}
                  onChange={(e) => setEditingMenu({...editingMenu, name: e.target.value})}
                  placeholder="Korean Spicy Chicken"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gambar/Foto Makanan</label>
                  <div className="image-upload" onClick={() => document.getElementById('editImageInput').click()}>
                    {editingMenu.imagePreview ? (
                      <img src={editingMenu.imagePreview} alt="Preview" className="image-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <svg width="95" height="95" viewBox="0 0 95 95" fill="none">
                          <path d="M20 75V25C20 21.6863 22.6863 19 26 19H69C72.3137 19 75 21.6863 75 25V75" stroke="#27086E" strokeWidth="2"/>
                          <circle cx="47.5" cy="47.5" r="15" stroke="#27086E" strokeWidth="2"/>
                          <path d="M47.5 40V55M40 47.5H55" stroke="#FFFFFF" strokeWidth="2"/>
                        </svg>
                      </div>
                    )}
                    <input
                      id="editImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Kategori</label>
                  <select
                    value={editingMenu.category}
                    onChange={(e) => setEditingMenu({...editingMenu, category: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Kategori</option>
                    {mockCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <label className="mt-3">Merek</label>
                  <input
                    type="text"
                    value={editingMenu.brand}
                    onChange={(e) => setEditingMenu({...editingMenu, brand: e.target.value})}
                    placeholder='Merek : "Indomie"'
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Harga</label>
                <input
                  type="text"
                  value={editingMenu.price}
                  onChange={(e) => setEditingMenu({...editingMenu, price: e.target.value})}
                  placeholder="Rp. 10.000,-"
                  className="form-input"
                />
              </div>

              {/* Topping/Additionals Section */}
              <div className="form-group">
                <label>Tambahan/Topping (Optional)</label>
                <p className="topping-note-top">Pilih topping yang tersedia untuk menu ini</p>
                
                {/* Topping Dropdown */}
                <div className="topping-select-section">
                  <select
                    onChange={(e) => {
                      const toppingName = e.target.value;
                      if (toppingName) {
                        const topping = availableToppings.find(t => t.name === toppingName);
                        if (topping && !editingMenu.additionals.find(a => a.name === topping.name)) {
                          setEditingMenu({
                            ...editingMenu,
                            additionals: [...editingMenu.additionals, topping]
                          });
                        }
                      }
                      e.target.value = '';
                    }}
                    className="form-select topping-dropdown"
                  >
                    <option value="">Pilih topping...</option>
                    {availableToppings.map((topping, idx) => (
                      <option key={idx} value={topping.name}>
                        {topping.name} - Rp. {topping.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    className="add-new-topping-btn" 
                    onClick={() => setShowAddToppingModal(true)}
                    title="Tambah topping baru"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="2"/>
                      <path d="M10 5V15M5 10H15" stroke="white" strokeWidth="2"/>
                    </svg>
                  </button>
                </div>

                {/* Available Toppings Management */}
                {availableToppings.length > 0 && (
                  <div className="available-toppings-section">
                    <p className="available-toppings-title">Topping yang tersedia:</p>
                    <div className="available-toppings-grid">
                      {availableToppings.map((topping, idx) => (
                        <div key={idx} className="available-topping-chip">
                          <span className="chip-text">{topping.name} - Rp. {topping.price.toLocaleString('id-ID')}</span>
                          <button 
                            type="button"
                            className="delete-chip-btn" 
                            onClick={() => handleDeleteTopping(topping.name)}
                            title="Hapus topping ini"
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M3 3L11 11M3 11L11 3" stroke="#FF4040" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* List of Added Toppings */}
                {editingMenu.additionals && editingMenu.additionals.length > 0 && (
                  <div className="toppings-list">
                    <p className="toppings-list-title">Topping yang ditambahkan:</p>
                    {editingMenu.additionals.map((topping, index) => (
                      <div key={index} className="topping-item">
                        <div className="topping-info">
                          <span className="topping-name">{topping.name}</span>
                          <span className="topping-price">Rp. {topping.price.toLocaleString('id-ID')},-</span>
                        </div>
                        <button 
                          type="button"
                          className="remove-topping-btn" 
                          onClick={() => {
                            const updatedAdditionals = editingMenu.additionals.filter((_, i) => i !== index);
                            setEditingMenu({
                              ...editingMenu,
                              additionals: updatedAdditionals
                            });
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 4L12 12M4 12L12 4" stroke="#FF4040" strokeWidth="2"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="stock-toggle-section">
                <button 
                  className={`stock-btn ${editingMenu.stock === 'ada' ? 'stock-available' : 'stock-out'}`}
                  onClick={() => setEditingMenu({...editingMenu, stock: editingMenu.stock === 'ada' ? 'habis' : 'ada'})}
                >
                  <span className="stock-circle"></span>
                  {editingMenu.stock === 'ada' ? 'Ada' : 'Habis'}
                </button>
              </div>

              <button className="save-menu-btn" onClick={handleSaveEditMenu}>
                Simpan Perubahan
              </button>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}