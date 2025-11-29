'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Alert } from 'react-bootstrap';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '/changepassword.css';
import { api } from '../../../utils/api';

export default function ChangePasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token;

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Konfirmasi kata sandi tidak sama.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.changePassword(token, formData.newPassword);

      if (!data) {
        setError('Tidak dapat terhubung ke server.');
        return;
      }

      if (!data.success) {
        setError(data.message || 'Gagal mengubah kata sandi.');
        return;
      }

      setSuccess(data.message || 'Password berhasil diubah.');
      // setelah beberapa detik, kembali ke login
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      console.error('Change password error (frontend):', err);
      setError('Terjadi kesalahan. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Navbar />

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
            <h2 className="login-title">Reset password</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit} className="login-form">
              <Form.Group className="mb-3">
                <Form.Label>Kata sandi baru</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  className="reset-input"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Konfirmasi kata sandi</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <button
                type="submit"
                className="reset-btn"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Perbarui kata sandi'}
              </button>

              <div className="register-link-section mt-3">
                <p>
                  Kembali ke{' '}
                  <a href="/login" className="reset-back-link">
                    Login
                  </a>
                </p>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <div className="homepage-footer">
        <p>
          Developed by <strong>HELD</strong>
        </p>
      </div>
    </div>
  );
}
