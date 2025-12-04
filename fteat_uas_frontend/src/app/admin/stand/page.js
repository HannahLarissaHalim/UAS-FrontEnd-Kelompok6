'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Modal } from 'react-bootstrap';
import Navbar from '../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { api } from '../../../utils/api';
import '../../custom.css';

export default function AdminStandPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedStallName, setEditedStallName] = useState('');
  const [editedProfileImage, setEditedProfileImage] = useState('');

  const loadVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.getVendorsForAdmin(token);
      if (res && res.success) {
        setVendors(res.data || []);
      }
    } catch (e) {
      console.error('Error loading vendors:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if admin is logged in
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (!token || role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadVendors();
  }, [router]);

  const toggleApprove = async (vendor, e) => {
    e?.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const newStatus = !vendor.isApproved;
      const res = await api.approveVendor(vendor._id, newStatus, token);
      if (res && res.success) {
        setVendors(prev => prev.map(v => v._id === vendor._id ? { ...v, isApproved: newStatus } : v));
        if (selectedVendor && selectedVendor._id === vendor._id) {
          setSelectedVendor({ ...selectedVendor, isApproved: newStatus });
        }
      } else {
        alert(res?.message || 'Gagal mengubah status vendor');
      }
    } catch (err) {
      console.error('Error toggling approval:', err);
      alert('Error mengubah status');
    }
  };

  const handleVendorClick = (vendor) => {
    setSelectedVendor(vendor);
    setEditedStallName(vendor.stallName || vendor.namaKantin || '');
    setEditedProfileImage(vendor.profileImage || '');
    setEditMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVendor(null);
    setEditMode(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async () => {
    if (!selectedVendor) return;

    try {
      const token = localStorage.getItem('token');
      const payload = {
        namaKantin: editedStallName,
        stallName: editedStallName,
        profileImage: editedProfileImage,
      };

      const res = await api.updateVendorByAdmin(selectedVendor._id, payload, token);
      if (res && res.success) {
        // Update vendors list
        setVendors(prev => prev.map(v => 
          v._id === selectedVendor._id 
            ? { ...v, stallName: editedStallName, namaKantin: editedStallName, profileImage: editedProfileImage }
            : v
        ));
        setSelectedVendor({ ...selectedVendor, stallName: editedStallName, namaKantin: editedStallName, profileImage: editedProfileImage });
        setEditMode(false);
        alert('Profil vendor berhasil diperbarui');
      } else {
        alert(res?.message || 'Gagal memperbarui profil vendor');
      }
    } catch (err) {
      console.error('Error updating vendor:', err);
      alert('Error memperbarui profil vendor');
    }
  };

  const handleDeleteVendor = async (vendor) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus vendor "${vendor.stallName || vendor.email}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const res = await api.deleteVendor(vendor._id, token);
      if (res && res.success) {
        setVendors(prev => prev.filter(v => v._id !== vendor._id));
        setShowModal(false);
        setSelectedVendor(null);
        alert('Vendor berhasil dihapus');
      } else {
        alert(res?.message || 'Gagal menghapus vendor');
      }
    } catch (err) {
      console.error('Error deleting vendor:', err);
      alert('Error menghapus vendor');
    }
  };

  if (loading) {
    return (
      <div className="stand-indonesia-page">
        <Navbar />
        <div style={{ padding: '150px 40px', textAlign: 'center', fontFamily: 'Montserrat', color: '#0A4988' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="stand-indonesia-page">
      <Navbar />

      {/* Stand Title */}
      <h1 className="stand-page-title">Verifikasi Vendor</h1>

      {/* Stand List Container */}
      <div className="stand-list-container">
        {vendors.length === 0 ? (
          <p className="stand-coming-soon">Belum ada vendor terdaftar</p>
        ) : (
          vendors.map((vendor, index) => (
            <div key={vendor._id}>
              <div className="stand-item" onClick={() => handleVendorClick(vendor)}>
                <div className="stand-item-icon">
                  {vendor.profileImage ? (
                    <img 
                      src={vendor.profileImage} 
                      alt={vendor.stallName}
                      style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="stand-item-info">
                  <span className="stand-item-name">{vendor.stallName || 'Unnamed Stand'}</span>
                  <div className="stand-item-details">
                    <span>VendorID: {vendor.VendorId}</span>
                    <span>Email: {vendor.email}</span>
                  </div>
                </div>
                <div className="stand-item-status" onClick={(e) => e.stopPropagation()}>
                  <span className={`status-badge ${vendor.isApproved ? 'approved' : 'pending'}`}>
                    {vendor.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={vendor.isApproved || false}
                      onChange={(e) => toggleApprove(vendor, e)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="stand-item-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              {index < vendors.length - 1 && <div className="stand-divider"></div>}
            </div>
          ))
        )}
      </div>

      {/* Decorative Elements - Desktop Only */}
      <div className="stand-decoration-rect-16"></div>
      <div className="stand-decoration-rect-15"></div>
      <div className="stand-decoration-rect-20"></div>

      {/* Promo Box */}
      <div className="stand-promo-rectangle">
        <p className="stand-promo-text">
          Kelola vendor yang terdaftar di platform FTEAT. 
          Approve vendor baru untuk mengaktifkan akun mereka.
        </p>
      </div>

      {/* Footer */}
      <div className="stand-footer">
        <span className="stand-footer-text">Developed by </span>
        <span className="stand-footer-held">HELD</span>
      </div>

      {/* Vendor Detail Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered className="vendor-detail-modal">
        <Modal.Header closeButton className="order-modal-header">
          <Modal.Title className="order-modal-title">Detail Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body className="order-modal-body">
          {selectedVendor && (
            <div className="modal-order-info">
              {/* Profile Image Section */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={editedProfileImage || '/images/navbar_icons/profile.png'} 
                    alt="Vendor Profile"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #0A4988'
                    }}
                  />
                  {editMode && (
                    <label style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      background: '#0A4988',
                      borderRadius: '50%',
                      width: '35px',
                      height: '35px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Nama Kantin - Editable */}
              <div className="modal-info-row">
                <span className="modal-label">Nama Kantin:</span>
                {editMode ? (
                  <input 
                    type="text"
                    value={editedStallName}
                    onChange={(e) => setEditedStallName(e.target.value)}
                    style={{
                      fontFamily: 'Montserrat',
                      fontSize: '0.95rem',
                      padding: '5px 10px',
                      border: '2px solid #0A4988',
                      borderRadius: '5px',
                      flex: 1
                    }}
                  />
                ) : (
                  <span className="modal-value">{selectedVendor.stallName || '-'}</span>
                )}
              </div>

              <div className="modal-info-row">
                <span className="modal-label">Vendor ID:</span>
                <span className="modal-value">{selectedVendor.VendorId || '-'}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-label">Email:</span>
                <span className="modal-value">{selectedVendor.email || '-'}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-label">WhatsApp:</span>
                <span className="modal-value">{selectedVendor.whatsapp || '-'}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-label">Nama Pemilik:</span>
                <span className="modal-value">{selectedVendor.vendorFirstName} {selectedVendor.vendorLastName || ''}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-label">Bank:</span>
                <span className="modal-value">{selectedVendor.bankName || '-'}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-label">No. Rekening:</span>
                <span className="modal-value">{selectedVendor.accountNumber || '-'}</span>
              </div>
              <div className="modal-info-row">
                <span className="modal-label">Status:</span>
                <span className={`modal-value ${selectedVendor.isApproved ? 'modal-status-verified' : 'modal-status-unpaid'}`}>
                  {selectedVendor.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                <span style={{ fontFamily: 'Montserrat', fontWeight: 600, color: '#0A4988' }}>Approve Vendor:</span>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={selectedVendor.isApproved || false}
                    onChange={(e) => toggleApprove(selectedVendor, e)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="order-modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="delete-vendor-btn" onClick={() => handleDeleteVendor(selectedVendor)}>
            Hapus Vendor
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            {editMode ? (
              <>
                <button 
                  className="modal-close-btn" 
                  onClick={() => {
                    setEditMode(false);
                    setEditedStallName(selectedVendor.stallName || selectedVendor.namaKantin || '');
                    setEditedProfileImage(selectedVendor.profileImage || '');
                  }}
                  style={{ background: '#6c757d' }}
                >
                  Batal
                </button>
                <button 
                  className="modal-close-btn" 
                  onClick={handleSaveEdit}
                  style={{ background: '#28a745' }}
                >
                  Simpan
                </button>
              </>
            ) : (
              <>
                <button 
                  className="modal-close-btn" 
                  onClick={() => setEditMode(true)}
                  style={{ background: '#0A4988' }}
                >
                  Edit Profil
                </button>
                <button className="modal-close-btn" onClick={handleCloseModal}>
                  Tutup
                </button>
              </>
            )}
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
