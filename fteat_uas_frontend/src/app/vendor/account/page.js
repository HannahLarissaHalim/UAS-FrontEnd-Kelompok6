"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Alert } from 'react-bootstrap';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css';
import VendorNavbar from '../../components/VendorNavbar';
import { api } from '../../../utils/api';
import './vendor-account.css';

export default function VendorAccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    stallName: '',
    whatsapp: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    vendorFirstName: '',
    vendorLastName: '',
    email: '',
  });
  const [profileImage, setProfileImage] = useState('/images/navbar_icons/profile.png');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return router.push('/vendor/login');
    const user = JSON.parse(userStr);
    setFormData(prev => ({ ...prev, 
      stallName: user.stallName || '',
      whatsapp: user.whatsapp || '',
      bankName: user.bankName || '',
      accountNumber: user.accountNumber || '',
      accountHolder: user.accountHolder || '',
      vendorFirstName: user.vendorFirstName || '',
      vendorLastName: user.vendorLastName || '',
      email: user.email || ''
    }));
    if (user.profileImage) {
      setProfileImage(user.profileImage);
    }
  }, [router]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/vendor/login');

      const payload = {
        whatsapp: formData.whatsapp,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder,
        vendorFirstName: formData.vendorFirstName,
        vendorLastName: formData.vendorLastName,
      };

      const res = await api.updateVendorProfile(payload, token);
      if (!res?.success) {
        setError(res?.message || 'Gagal memperbarui profil');
        return;
      }

      // update localStorage user
      localStorage.setItem('user', JSON.stringify(res.data));
      
      // Dispatch event to update other pages (e.g., welcome page)
      window.dispatchEvent(new Event('userUpdated'));
      
      setSuccess('Profil berhasil diperbarui');
    } catch (err) {
      console.error('Update profile error', err);
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    router.push('/vendor/login');
  };

  const handleBack = () => {
    router.push('/vendor/welcome');
  };

  return (
    <div className="vendor-account-page">
      <VendorNavbar />

      <div className="vendor-account-wrapper">
        {/* Background Logo */}
        <div className="vendor-account-bg-logo">
          <Image
            src="/images/logo.png"
            alt="FTEat Logo"
            width={500}
            height={500}
            unoptimized
          />
        </div>

        {/* Back Button */}
        <button 
          className="vendor-account-back-btn"
          onClick={handleBack}
          type="button"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="vendor-account-header">
          <svg className="vendor-account-icon" width="50" height="50" viewBox="0 0 68 68" fill="none">
            <path d="M34 42.5C38.6944 42.5 42.5 38.6944 42.5 34C42.5 29.3056 38.6944 25.5 34 25.5C29.3056 25.5 25.5 29.3056 25.5 34C25.5 38.6944 29.3056 42.5 34 42.5Z" stroke="#0A4988" strokeWidth="4"/>
            <path d="M34 8.5V17M34 51V59.5M8.5 34H17M51 34H59.5M14.45 14.45L20.4 20.4M47.6 47.6L53.55 53.55M14.45 53.55L20.4 47.6M47.6 20.4L53.55 14.45" stroke="#0A4988" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <h1 className="vendor-account-title">Account Setup</h1>
        </div>

        {/* Form Card */}
        <div className="vendor-account-card">
          {error && <Alert variant="danger" className="vendor-alert">{error}</Alert>}
          {success && <Alert variant="success" className="vendor-alert">{success}</Alert>}

          <Form onSubmit={handleSubmit} className="vendor-account-form">
            {/* Profile Image - Read Only */}
            <div className="vendor-profile-upload">
              <div className="vendor-profile-image-wrapper">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="vendor-profile-image"
                />
              </div>
              <p className="vendor-profile-hint" style={{ color: '#888', fontStyle: 'italic' }}>
                Foto profil dan nama kantin hanya dapat diubah oleh Admin
              </p>
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">Email (tidak dapat diubah)</label>
              <input type="email" name="email" value={formData.email} readOnly className="vendor-form-input readonly" />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">Nama Stand (tidak dapat diubah)</label>
              <input type="text" name="stallName" value={formData.stallName} readOnly className="vendor-form-input readonly" />
            </div>

            <div className="vendor-form-row">
              <div className="vendor-form-group half">
                <label className="vendor-form-label">Nama Depan</label>
                <input type="text" name="vendorFirstName" value={formData.vendorFirstName} onChange={handleChange} className="vendor-form-input" />
              </div>
              <div className="vendor-form-group half">
                <label className="vendor-form-label">Nama Belakang</label>
                <input type="text" name="vendorLastName" value={formData.vendorLastName} onChange={handleChange} className="vendor-form-input" />
              </div>
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">No. WhatsApp</label>
              <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="vendor-form-input" />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-form-label">Nama Bank</label>
              <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="vendor-form-input" />
            </div>

            <div className="vendor-form-row">
              <div className="vendor-form-group half">
                <label className="vendor-form-label">No. Rekening</label>
                <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="vendor-form-input" />
              </div>
              <div className="vendor-form-group half">
                <label className="vendor-form-label">Nama Pemilik</label>
                <input type="text" name="accountHolder" value={formData.accountHolder} onChange={handleChange} className="vendor-form-input" />
              </div>
            </div>

            <div className="vendor-account-buttons">
              <button type="submit" className="vendor-btn-save" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button type="button" className="vendor-btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </Form>
        </div>

        {/* Footer */}
        <div className="vendor-account-footer">
          <span className="vendor-footer-text">Developed by </span>
          <span className="vendor-footer-held">HELD</span>
        </div>
      </div>
    </div>
  );
}
