"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { api } from '../../../utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function VendorPendingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('pending');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const e = localStorage.getItem('vendor_registration_email') || localStorage.getItem('email');
    if (e) setEmail(e);
  }, []);

  useEffect(() => {
    let timer;
    const poll = async () => {
      if (!email) return;
      setChecking(true);
      try {
        const res = await api.getVendors();
        if (res && res.success) {
          const vendor = (res.data || []).find(v => v.email === email);
          if (vendor) {
            if (vendor.isApproved) {
              setStatus('approved');
              timer = setTimeout(() => router.push('/vendor/login'), 3000);
            } else {
              setStatus('pending');
            }
          }
        }
      } catch (err) {
        console.error('Error checking vendor status', err);
      } finally {
        setChecking(false);
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [email, router]);

  return (
    <div>
      <Navbar />
      <div style={{ padding: 24 }}>
        <h2>Registrasi Vendor Diterima</h2>
        <p>
          Terima kasih {email ? `(${email})` : ''} — akun vendor Anda telah diterima dan sedang menunggu verifikasi oleh admin.
        </p>

        {status === 'pending' && (
          <>
            <p>Status: <strong>Menunggu verifikasi</strong></p>
            <p>Admin akan memeriksa dan menyetujui pendaftaran Anda. Anda akan mendapatkan pemberitahuan ketika akun disetujui.</p>
            <button onClick={() => router.push('/vendor/login')} className="btn btn-outline-primary">Kembali ke Login</button>
            <span style={{ marginLeft: 12 }}>{checking ? 'Memeriksa status...' : ''}</span>
          </>
        )}

        {status === 'approved' && (
          <>
            <p>Status: <strong style={{ color: 'green' }}>Disetujui</strong></p>
            <p>Anda akan diarahkan ke halaman login dalam beberapa detik. Atau klik tombol berikut untuk masuk sekarang.</p>
            <button onClick={() => router.push('/vendor/login')} className="btn btn-primary">Login</button>
          </>
        )}
      </div>
    </div>
  );
}
