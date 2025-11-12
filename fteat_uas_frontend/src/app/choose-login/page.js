'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

export default function ChooseLoginPage() {
  const router = useRouter();

  return (
    <div className="choose-login-page">
      <Navbar />

      <div className="choose-login-container">
        {/* Left side - logo
        <div className="choose-login-left">
          <Image
            src="/images/logo.png"
            alt="FTEat Logo"
            width={450}
            height={450}
            unoptimized
          />
        </div> */}

        {/* Right side - options */}
        <div className="choose-login-right">
          <h2 className="choose-login-title">Login</h2>

          <div className="choose-login-buttons">
            <button
              className="choose-btn mahasiswa-btn"
              onClick={() => router.push('/login')}
            >
              <span>Mahasiswa</span>
            </button>

            <button
              className="choose-btn vendor-btn"
              onClick={() => router.push('/vendor-welcome')}
            >
              <span>Vendor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="homepage-footer">
        <p>
          Developed by <strong>HELD</strong>
        </p>
      </div>
    </div>
  );
}
