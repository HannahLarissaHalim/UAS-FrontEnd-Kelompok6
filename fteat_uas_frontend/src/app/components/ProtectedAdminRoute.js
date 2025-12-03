'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedAdminRoute({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Cek token
        const token = localStorage.getItem('token');
        console.log('[ProtectedAdminRoute] Token:', token ? 'EXISTS' : 'NOT FOUND');
        if (!token) {
          console.warn('[ProtectedAdminRoute] No token found');
          router.push('/admin/login');
          return;
        }

        // 2. Cek user data
        const userStr = localStorage.getItem('user');
        console.log('[ProtectedAdminRoute] User string:', userStr);
        if (!userStr) {
          console.warn('[ProtectedAdminRoute] No user data found');
          router.push('/admin/login');
          return;
        }

        // 3. Parse user data
        let user;
        try {
          user = JSON.parse(userStr);
          console.log('[ProtectedAdminRoute] Parsed user:', user);
        } catch (parseError) {
          console.error('[ProtectedAdminRoute] Failed to parse user data:', parseError);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          router.push('/admin/login');
          return;
        }

        // 4. Cek role admin
        console.log('[ProtectedAdminRoute] User role:', user.role);
        if (user.role !== 'admin') {
          console.warn('[ProtectedAdminRoute] User is not an admin, role:', user.role);
          router.push('/admin/login');
          return;
        }

        // 5. Semua validasi passed
        console.log('[ProtectedAdminRoute] ✅ Authorization successful');
        setIsAuthorized(true);
      } catch (error) {
        console.error('[ProtectedAdminRoute] Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

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
          FTEat Admin
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

  if (isAuthorized) {
    return <>{children}</>;
  }

  return null;
}