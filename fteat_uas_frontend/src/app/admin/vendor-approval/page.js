'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../../utils/api'; // <-- Perbaikan untuk Default Import

export default function AdminVendorApproval() {
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.getVendorsForAdmin(token);
      if (res && res.success) setVendors(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleApprove = async (v) => {
    try {
      const token = localStorage.getItem('token');
      // Catatan: Asumsi fungsi approveVendor di api.js sudah diupdate untuk menerima 3 parameter
      const res = await api.approveVendor(v._id, !v.isApproved, token);
      if (res && res.success) {
        // update local list
        setVendors(prev => prev.map(x => x._id === v._id ? res.data : x));
      } else {
        alert(res?.message || 'Gagal update');
      }
    } catch (err) {
      console.error(err);
      alert('Error');
    }
  };

  if (loading) return <div style={{padding:40}}>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24 }}>
        <h2>Vendor Approval</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>VendorId</th><th>Stall</th><th>Email</th><th>WA</th><th>Approved</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v._id}>
                <td>{v.VendorId}</td>
                <td>{v.stallName}</td>
                <td>{v.email}</td>
                <td>{v.whatsapp}</td>
                <td>{v.isApproved ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => toggleApprove(v)}>
                    {v.isApproved ? 'Revoke' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}