'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState('/images/profile_dummy.png');

  useEffect(() => {
    // ambil data user dari localStorage
    const userData = localStorage.getItem('user');

    if (!userData) {
      router.push('/login'); // jika belum login langsung ke halaman login
      return;
    }
    // const parsedUser = JSON.parse(userData); // ubah string JSON ke object JS

    let parsedUser = null;
    try {
      parsedUser = JSON.parse(userData); 
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      router.push('/login');
      return;
    }

    if (!parsedUser) {
      router.push('/login');
      return;
    }

    // Build full name for display
    if (parsedUser.firstName && parsedUser.lastName) {
      parsedUser.name = `${parsedUser.firstName} ${parsedUser.lastName}`;
    } else if (parsedUser.firstName) {
      parsedUser.name = parsedUser.firstName;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(parsedUser);
    
    // Load profile image dari database (dari localStorage yang sudah di-sync dengan database)
    if (parsedUser.profileImage) {
      setProfileImage(parsedUser.profileImage);
    } else {
      // Fallback ke default jika tidak ada
      setProfileImage('/images/profile_dummy.png');
    }

    // Listen for profile updates from account settings
    const handleUserUpdate = () => {
      const updatedUserData = localStorage.getItem('user');
      if (updatedUserData) {
        try {
          const parsedUpdatedUser = JSON.parse(updatedUserData);
          
          // Build full name
          if (parsedUpdatedUser.firstName && parsedUpdatedUser.lastName) {
            parsedUpdatedUser.name = `${parsedUpdatedUser.firstName} ${parsedUpdatedUser.lastName}`;
          } else if (parsedUpdatedUser.firstName) {
            parsedUpdatedUser.name = parsedUpdatedUser.firstName;
          }
          
          setUser(parsedUpdatedUser);

          // Update profile image
          if (parsedUpdatedUser.profileImage) {
            setProfileImage(parsedUpdatedUser.profileImage);
          }
        } catch (error) {
          console.error("Error parsing updated user data:", error);
        }
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, [router]);

  if (!user) {
    return null;
  }

  const displayName = user.displayName || user.nickname || user.name || 'User';

  return (
    <ProtectedRoute>
      <div className="welcome-profile-page">
        <Navbar />

        {/* Background Logo - positioned left */}
        <div className="welcome-bg-logo">
          <Image 
            src="/images/logo.png" 
            alt="FTEat Logo" 
            width={550}
            height={550}
            unoptimized
          />
        </div>

        {/* Content Wrapper - positions content to the right on desktop */}
        <div className="welcome-content-wrapper">
          {/* Welcome Text */}
          <h1 className="welcome-title">Welcome!</h1>

          {/* Profile Image - inside wrapper for mobile ordering */}
          <div className="welcome-profile-image">
            <Image 
              src={profileImage} 
              alt="Profile" 
              width={150}
              height={150}
              unoptimized
            />
          </div>

          {/* Profile Section */}
          <div className="welcome-profile-section">
            {/* Profile Info Container */}
            <div className="welcome-profile-info">
              {/* Name Box - Display displayName (nickname atau fullname) */}
              <div className="welcome-name-box">
                <h2 className="welcome-user-name">{displayName}</h2>
              </div>

              {/* Info Box */}
              <div className="welcome-info-box">
                <div className="welcome-info-row">
                  <span className="welcome-info-label">{user.faculty || 'Teknologi Informasi'}</span>
                </div>
                <div className="welcome-info-row">
                  <span className="welcome-info-npm">{user.npm || '535220142'}</span>
                  <span className="welcome-info-separator">——</span>
                  <span className="welcome-info-program">{user.major || 'Teknik Informatika'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - in single white rounded box */}
          <div className="welcome-action-buttons">
            <button 
              className="welcome-action-btn"
              onClick={() => router.push('/account-settings')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="#0A4988"/>
              </svg>
              Account Settings
            </button>
            <button 
              className="welcome-action-btn"
              onClick={() => router.push('/history-order')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#0A4988"/>
              </svg>
              History Order
            </button>
          </div>

          {/* Footer - inside wrapper for mobile centering */}
          <div className="welcome-footer">
            <span className="welcome-footer-text">Developed by </span>
            <span className="welcome-footer-text welcome-footer-held">HELD</span>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}