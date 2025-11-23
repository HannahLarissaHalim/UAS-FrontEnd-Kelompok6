"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Alert, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import VendorNavbar from '../../components/VendorNavbar';
import { api } from '../../../utils/api';
import '../../custom.css'; // pastikan ada styling tambahan

export default function VendorAccountPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    stallName: '',
    whatsapp: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    vendorFirstName: '',
    vendorLastName: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return router.push('/vendor/login');
    const user = JSON.parse(userStr);
    setFormData(prev => ({ ...prev, 
      stallName: user.stallName || '',
      whatsapp: user.whatsapp || '',
      bankName: user.bankName || '',
      accountNumber: user.accountNumber || '',
      accountHolder: user.accountHolder || '',
      vendorFirstName: user.vendorFirstName || '',
      vendorLastName: user.vendorLastName || '',
      email: user.email || ''
    }));
  }, [router]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return router.push('/vendor/login');

      const payload = {
        stallName: formData.stallName,
        whatsapp: formData.whatsapp,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder,
        vendorFirstName: formData.vendorFirstName,
        vendorLastName: formData.vendorLastName,
      };

      const res = await api.updateVendorProfile(payload, token);
      if (!res?.success) {
        setError(res?.message || 'Gagal memperbarui profil');
        return;
      }

      // update localStorage user
      localStorage.setItem('user', JSON.stringify(res.data));
      setSuccess('Profil berhasil diperbarui');
    } catch (err) {
      console.error('Update profile error', err);
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    router.push('/vendor/login');
  };

  return (
    <div>
      <VendorNavbar />

      <div className="d-flex justify-content-center align-items-start mt-5">
        <Card style={{ maxWidth: '600px', width: '100%', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Card.Body>
            <h3 className="mb-4 text-center">Vendor Account Setup</h3>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email (tidak dapat diubah)</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} readOnly />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nama Stand</Form.Label>
                <Form.Control type="text" name="stallName" value={formData.stallName} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nama Depan</Form.Label>
                <Form.Control type="text" name="vendorFirstName" value={formData.vendorFirstName} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nama Belakang</Form.Label>
                <Form.Control type="text" name="vendorLastName" value={formData.vendorLastName} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>No. WhatsApp</Form.Label>
                <Form.Control type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nama Bank</Form.Label>
                <Form.Control type="text" name="bankName" value={formData.bankName} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>No. Rekening</Form.Label>
                <Form.Control type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Nama Pemilik Rekening</Form.Label>
                <Form.Control type="text" name="accountHolder" value={formData.accountHolder} onChange={handleChange} />
              </Form.Group>

              <div className="d-flex justify-content-between">
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
                <button type="button" className="btn btn-outline-secondary" onClick={handleLogout}>Logout</button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
