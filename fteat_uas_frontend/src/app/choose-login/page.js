'use client';

import Navbar from '../components/Navbar';
import Link from 'next/link';
import '../custom.css';

export default function ChooseLoginPage() {
  return (
    <div className="choose-login-page">

      <Navbar />

      {/* TITLE */}
      <h1 className="choose-login-title">Login Sebagai</h1>

      {/* BUTTONS */}
      <div className="choose-login-buttons-center">

        <Link href="/login" className="no-underline">
          <div className="role-btn mahasiswa">
            <span className="icon">🎓</span>
            <span className="text">Mahasiswa</span>
          </div>
        </Link>

        <Link href="/vendor-login" className="no-underline">
          <div className="role-btn vendor">
            <span className="icon">🧺</span>
            <span className="text">Vendor</span>
          </div>
        </Link>

      </div>

      <footer className="choose-footer">
        <p>Developed by <strong>HELD</strong></p>
      </footer>

    </div>
  );
}
