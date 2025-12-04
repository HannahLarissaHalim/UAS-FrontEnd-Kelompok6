'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import VendorNavbar from '../../components/VendorNavbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import './vendor-welcome.css';

export default function VendorWelcomePage() {
  const router = useRouter();
  const [vendorData, setVendorData] = useState(null);

  useEffect(() => {
    const loadVendorData = () => {
      // Check if user is logged in and is a vendor
      const user = localStorage.getItem('user');

      // If no user found, redirect to vendor login (no dummy data)
      if (!user) {
        router.push('/vendor/login');
        return;
      }

      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'vendor') {
          // not a vendor -> redirect to login
          router.push('/vendor/login');
          return;
        }

        // Use real stored vendor data
        setVendorData(userData);
      } catch (err) {
        // If parsing fails, clear and redirect
        console.error('Invalid user in localStorage:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/vendor/login');
      }
    };

    loadVendorData();

    // Listen for user updates (from account page)
    const handleUserUpdate = () => {
      loadVendorData();
    };
    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, [router]);

  const handleMenuClick = () => {
    router.push('/vendor/menu');
  };

  const handlePesananClick = () => {
    router.push('/vendor/pesanan');
  };

  const handleAccountSetup = () => {
    router.push('/vendor/account');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    router.push('/vendor/login');
  };

  const handleBack = () => {
    router.push('/home');
  };

  if (!vendorData) {
    return null;
  }

  return (
    <div className="vendor-welcome-page">
      <VendorNavbar />

      <div className="vendor-welcome-wrapper">
        {/* Background Logo */}
        <div className="vendor-bg-logo">
          <Image
            src="/images/logo.png"
            alt="FTEat Logo"
            width={450}
            height={450}
            unoptimized
          />
        </div>

        {/* Back Button */}
        <button 
          className="vendor-back-button"
          onClick={handleBack}
          aria-label="Back to home"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>

        {/* Welcome Title */}
        <div className="vendor-welcome-header">
          <svg className="vendor-welcome-icon" width="68" height="68" viewBox="0 0 68 68" fill="none">
            <path d="M34 8.5C19.917 8.5 8.5 19.917 8.5 34C8.5 48.083 19.917 59.5 34 59.5C48.083 59.5 59.5 48.083 59.5 34C59.5 19.917 48.083 8.5 34 8.5Z" stroke="#0A4988" strokeWidth="4"/>
            <path d="M25.5 34L31.167 39.667L42.5 28.333" stroke="#0A4988" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="vendor-welcome-title">Selamat datang!</h1>
        </div>

        {/* Profile Section */}
        <div className="vendor-profile-section">
          {/* Vendor Profile Image */}
          <div className="vendor-profile-wrapper">
            <div className="vendor-profile-image">
              <img
                src={vendorData.profileImage || '/images/navbar_icons/profile.png'}
                alt="Vendor Profile"
                width={180}
                height={180}
                className="vendor-profile-img"
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>

          {/* Vendor Name Box */}
          <div className="vendor-name-box">
            <span className="vendor-user-name">{vendorData.stallName || 'Kantin Bursa Lt.7'}</span>
          </div>

          {/* Email Section */}
          <div className="vendor-form-group">
            <label className="vendor-form-label">Email</label>
            <div className="vendor-form-input-box">
              <span className="vendor-form-input-text">{vendorData.email || 'fteat_kantinbursalt7@gmail.com'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="vendor-action-buttons">
          <button onClick={handleMenuClick} className="vendor-btn-menu">
            <Image
              src="/images/ikon_menu_vendor.png"
              alt="Menu Icon"
              width={40}
              height={40}
              unoptimized
            />
            <span>Menu</span>
          </button>
          <button onClick={handlePesananClick} className="vendor-btn-pesanan">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9 11L12 14L22 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Pesanan</span>
          </button>
          <button onClick={handleAccountSetup} className="vendor-btn-account">
            <span>Account Setup</span>
          </button>
          <button onClick={handleLogout} className="vendor-btn-logout">
            <span>Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="vendor-footer">
          <span className="vendor-footer-text">Developed by </span>
          <span className="vendor-footer-held">HELD</span>
        </div>
      </div>
    </div>
  );
}
