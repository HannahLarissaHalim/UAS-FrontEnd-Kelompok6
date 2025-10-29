'use client';
import { useState } from 'react';
import { Form, Alert } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import HomeNavbar from '../components/HomeNavbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

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
      // TODO: Replace with actual API call
      // const response = await api.login(formData.npm, formData.password);
      
      // Mock login for testing
      if (formData.npm && formData.password) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({
          npm: formData.npm,
          name: 'User Name', // This should come from API
          role: 'customer', // or 'vendor'
        }));
        
        // Redirect to dashboard
        router.push('/dashboard/customer');
      } else {
        setError('NPM dan password harus diisi');
      }
    } catch (err) {
      setError('Login gagal. Periksa NPM dan password Anda.');
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
