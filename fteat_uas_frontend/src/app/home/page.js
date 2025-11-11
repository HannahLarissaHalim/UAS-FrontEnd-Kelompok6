'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';
import Navbar from '../components/Navbar';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="theme2-homepage">
      <Navbar />
      
      {/* Hero Section - Logo and Brand Text */}
      <div className="hero-content">
        <div className="hero-left">
          <Image 
            src="/images/logo.png" 
            alt="FTEAT - Teknik Rekayasa Rasa" 
            width={400}
            height={400}
            className="hero-logo"
            priority
            unoptimized
          />
        </div>
        
        <div className="hero-right">
          {/* Brand Text with Special R Styling */}
          <div className="brand-text">
            <div className="brand-line">
              <span className="brand-word">Teknik</span>
            </div>
            <div className="brand-line">
              <span className="brand-word">
                <span className="brand-r">R</span>
                <span className="brand-rest">ekayasa</span>
              </span>
            </div>
            <div className="brand-line">
              <span className="brand-word">
                <span className="brand-r">R</span>
                <span className="brand-rest">asa</span>
              </span>
            </div>
          </div>
          
          {/* Register / Login Section */}
          <div className="auth-section">
            <Link href="/register" className="auth-text-link">
              Register
            </Link>
            <span className="auth-text"> | </span>
            <Link href="/choose-login" className="auth-link-home">
              Login
            </Link>
            <div className="user-icon">
              <Image 
                src="/images/logo.png" 
                alt="User Icon" 
                width={50}
                height={50}
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="homepage-footer">
        <p>Developed by <strong>HELD</strong></p>
      </div>
    </div>
  );
}
