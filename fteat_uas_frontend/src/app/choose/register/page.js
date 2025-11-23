"use client";
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../login/choose-login.css'; // pakai CSS login biar sama

export default function ChooseRegisterPage() {
  const router = useRouter();

  return (
    <div className="choose-login-page">
      <Navbar />

      <div className="choose-login-body">

        <h2 className="choose-login-title">Register sebagai...</h2>

        <div className="role-container">

          <div className="role-card mahasiswa" onClick={() => router.push('/register')}>
            <span className="icon">🎓</span>
            <span className="text">Mahasiswa</span>
          </div>

          <div className="role-card vendor" onClick={() => router.push('/vendor/register')}>
            <span className="icon">🧺</span>
            <span className="text">Vendor</span>
          </div>

        </div>
      </div>

      <div className="homepage-footer">
        <p>Developed by <strong>HELD</strong></p>
      </div>
    </div>
  );
}
