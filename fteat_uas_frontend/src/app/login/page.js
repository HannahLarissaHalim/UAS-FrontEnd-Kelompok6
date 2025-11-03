'use client';
import { useState } from 'react';
import { Form, Alert } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import HomeNavbar from '../components/HomeNavbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';
import { api } from '../../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    npm: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(formData.npm, formData.password);

      if (!data) {
        setError('Tidak dapat terhubung ke server');
        return;
      }

      if (!data.success) {
        setError(data.message || 'Login gagal. Periksa NPM dan password Anda.');
        return;
      }

      // Successful login: store token and user info
      const token = data.data?.token;
      const user = {
        npm: data.data?.npm || formData.npm,
        firstName: data.data?.firstName || '',
        lastName: data.data?.lastName || '',
        role: data.data?.role || 'customer'
      };

      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      if (user.role === 'vendor') {
        router.push('/dashboard/vendor');
      } else {
        router.push('/dashboard/customer');
      }
    } catch (err) {
      console.error('Login error (frontend):', err);
      setError('Login gagal. Periksa koneksi atau coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <HomeNavbar />

      <div className="login-container">
        <div className="login-left">
          <Image
            src="/images/logo.png"
            alt="FTEAT Logo"
            width={500}
            height={500}
            className="login-logo"
            unoptimized
          />
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2 className="login-title">Login</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="login-form">
              <Form.Group className="mb-3">
                <Form.Label>Nomor Induk Mahasiswa</Form.Label>
                <Form.Control
                  type="text"
                  name="npm"
                  value={formData.npm}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Kata Sandi</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="forgot-password-link mb-3">
                <p>Lupa Kata Sandi? | <Link href="/forgot-password" className="register-link">Klik di sini</Link></p>
              </div>

              <div className="register-link-section mb-3">
                <p>Belum punya akun? <Link href="/register" className="register-link">Daftar di sini</Link></p>
              </div>

              <button
                type="submit"
                className="login-btn w-100"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
            </Form>
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
