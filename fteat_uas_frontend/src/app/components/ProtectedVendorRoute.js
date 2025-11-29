'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Protected route wrapper untuk halaman vendor
 */
export default function ProtectedVendorRoute({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Cek token
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('[ProtectedVendorRoute] No token found');
          router.push('/vendor/login');
          return;
        }

        // 2. Cek user data
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.warn('[ProtectedVendorRoute] No user data found');
          router.push('/vendor/login');
          return;
        }

        // 3. Parse user data
        let user;
        try {
          user = JSON.parse(userStr);
        } catch (parseError) {
          console.error('[ProtectedVendorRoute] Failed to parse user data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          router.push('/vendor/login');
          return;
        }

        // 4. Cek role vendor
        if (user.role !== 'vendor') {
          console.warn('[ProtectedVendorRoute] User is not a vendor, role:', user.role);
          router.push('/vendor/login');
          return;
        }

        // 5. Semua validasi passed
        console.log('[ProtectedVendorRoute] Authorization successful');
        setIsAuthorized(true);
      } catch (error) {
        console.error('[ProtectedVendorRoute] Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        router.push('/vendor/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          fontSize: '24px',
          color: '#27086E',
          marginBottom: '16px',
          fontWeight: 'bold'
        }}>
          FTEat
        </div>
        <div style={{
          fontSize: '16px',
          color: '#666'
        }}>
          Memuat...
        </div>
      </div>
    );
  }

  // Authorized - render children
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Not authorized - render nothing (will redirect)
  return null;
}