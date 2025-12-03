"use client";
import { useState } from 'react';
import { Form, Alert } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../custom.css';
import { api } from '../../../utils/api'; 
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AdminLoginPage() {

  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '', 
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);

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
      const data = await api.loginAdmin(formData.email, formData.password);

      if (!data?.success) {
        setError(data?.message || "Login admin gagal.");
        return;
      }

      const token = data.data?.token;
      if (token) localStorage.setItem("token", token);

      localStorage.setItem("user", JSON.stringify(data.data));
      localStorage.setItem("role", "admin"); 

      router.push("/admin/stand"); 

    } catch (err) {
      setError("Gagal login admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Navbar />

      <div className="login-container">
        <div className="login-left">
          <Image src="/images/logo.png" alt="FTEAT Logo" width={500} height={500} className="login-logo" unoptimized />
        </div>

        <div className="login-right">
          <div className="login-card">

            <h2 className="login-title">Admin Login</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="login-form">
              
              <Form.Group className="mb-3">
                <Form.Label>Email Admin</Form.Label>
                <Form.Control 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <div className="password-wrapper">
                  <Form.Control 
                    type={showLoginPass ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                  />
                  <span className="password-toggle" onClick={() => setShowLoginPass(!showLoginPass)}>
                    {showLoginPass ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </Form.Group>

              <button type="submit" className="login-btn w-100" disabled={loading}>
                {loading ? 'Loading...' : 'Login'}
              </button>
            </Form>
          </div>
        </div>
      </div>

      <div className="homepage-footer">
        <p>Developed by <strong>HELD</strong></p>
      </div>
    </div>
  );
}
