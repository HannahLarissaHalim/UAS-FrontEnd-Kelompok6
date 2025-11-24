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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVendorData(userData);
    } catch (err) {
      // If parsing fails, clear and redirect
      console.error('Invalid user in localStorage:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/vendor/login');
    }
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

  const handleHomeClick = () => {
    router.push('/home');
  };

  if (!vendorData) {
    return null;
  }

  return (
    <div className="vendor-welcome-page">
      <VendorNavbar />

      {/* Background Logo */}
      <div className="background-logo">
        <Image
          src="/images/logo.png"
          alt="FTEat Logo"
          width={822}
          height={822}
          unoptimized
        />
      </div>

      {/* Main Content */}
      <div className="welcome-content">
        <h1 className="welcome-title">Selamat datang!</h1>

        <div className="vendor-info-section">
          {/* Vendor Icon */}
          <div className="vendor-icon-container">
            <div className="vendor-icon-circle">
              <Image
                src="/images/ikon_indomie.png"
                alt="Vendor Icon"
                width={177}
                height={153}
                unoptimized
              />
            </div>
          </div>

          {/* Vendor Details */}
          <div className="vendor-details">
            <div className="vendor-name-box">
              <h2 className="vendor-name">{vendorData.stallName || 'Kantin Bursa Lt.7'}</h2>
            </div>

            <div className="vendor-email-section">
              <label className="email-label">Email</label>
              <div className="vendor-email-box">
                <p className="vendor-email">{vendorData.email || 'fteat_kantinbursalt7@gmail.com'}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button onClick={handleMenuClick} className="menu-button">
                <Image
                  src="/images/ikon_menu_vendor.png"
                  alt="Menu Icon"
                  width={64}
                  height={62}
                  unoptimized
                  className="button-icon"
                />
                <span>Menu</span>
              </button>
              <button onClick={handleAccountSetup} className="account-button">
                <span>Account Setup</span>
              </button>
              <button onClick={handlePesananClick} className="pesanan-button">
                <svg className="order-icon" width="51" height="51" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11L12 14L22 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Pesanan</span>
              </button>
              <button onClick={handleLogout} className="logout-button">
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="stand-footer">
        <span className="stand-footer-text">Developed by </span>
        <span className="stand-footer-held">HELD</span>
      </div>
    </div>
  );
}
