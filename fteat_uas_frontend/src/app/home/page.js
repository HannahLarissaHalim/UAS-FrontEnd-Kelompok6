'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '/home.css';
import Navbar from '../components/Navbar';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Navbar />   {/* <-- KELUAR DARI THEME2-HOMEPAGE */}
      
      <div className="theme2-homepage">
      
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
              <div className="brand-line brand-rekayasa-line">
                <span className="brand-r-large">R</span>
                <div className="brand-stacked">
                  <span className="brand-rest">ekayasa</span>
                  <span className="brand-rest">asa</span>
                </div>
              </div>
            </div>
          
            {/* Register / Login Section */}
            <div className="auth-section">
              <Link href="/choose/register" className="auth-text-link">
                Register
              </Link>
              <span className="auth-text"> | </span>
              <Link href="/choose/login" className="auth-link-home">
                Login
              </Link>
            </div>
          </div>
        </div>
      
        {/* Footer */}
        <div className="homepage-footer">
          <p>Developed by <strong>HELD</strong></p>
        </div>

      </div>
    </>
  );
}
