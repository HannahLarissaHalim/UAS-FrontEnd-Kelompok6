'use client';
import { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import Image from 'next/image';
import Link from 'next/link';
import HomeNavbar from '../components/HomeNavbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Semua field harus diisi');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement actual password reset API call
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Password berhasil diperbarui! Silakan login dengan password baru Anda.');
      setFormData({ newPassword: '', confirmPassword: '' });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      {/* Navbar */}
      <div className="page-navbar">
        <HomeNavbar />
      </div>

      <Container className="forgot-password-container">
        <Row className="justify-content-center align-items-center min-vh-80">
          {/* Left: Logo */}
          <Col lg={5} md={6} className="text-center mb-4 mb-lg-0">
            <Image 
              src="/images/logo.png" 
              alt="FTEAT Logo" 
              width={350}
              height={350}
              className="forgot-password-logo"
              priority
              unoptimized
            />
          </Col>

          {/* Right: Reset Password Form */}
          <Col lg={5} md={6}>
            <div className="forgot-password-form-container">
              <h2 className="forgot-password-title">Reset password</h2>
              
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
              {success && <Alert variant="success" className="mb-3">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="forgot-password-label">Kata sandi baru</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="forgot-password-input"
                    placeholder=""
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="forgot-password-label">Konfirmasi kata sandi</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="forgot-password-input"
                    placeholder=""
                    disabled={loading}
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  className="forgot-password-submit-btn w-100"
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Perbarui kata sandi'}
                </Button>

                <div className="text-center mt-3">
                  <Link href="/login" className="back-to-login-link">
                    Kembali ke Login
                  </Link>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <div className="homepage-footer">
        <p>Developed by <strong>HELD</strong></p>
      </div>
    </div>
  );
}
