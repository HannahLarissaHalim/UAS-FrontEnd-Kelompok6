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

        {/* Background Logo */}
        <div className="welcome-bg-logo">
          <Image 
            src="/images/logo.png" 
            alt="FTEat Logo" 
            width={822}
            height={822}
            unoptimized
          />
        </div>

        {/* Welcome Text */}
        <h1 className="welcome-title">Welcome!</h1>

        {/* Profile Section */}
        <div className="welcome-profile-section">
          {/* Profile Image - Display dari database */}
          <div className="welcome-profile-image">
            <Image 
              src={profileImage} 
              alt="Profile" 
              width={180}
              height={180}
              unoptimized
            />
          </div>

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

        {/* Action Buttons */}
        <div className="welcome-action-buttons">
          <button 
            className="welcome-action-btn"
            onClick={() => router.push('/account-settings')}
          >
            <Image 
              src="/images/navbar_icons/profile.png" 
              alt="Settings" 
              width={48}
              height={48}
              unoptimized
            />
            Account Settings
          </button>
          <button 
            className="welcome-action-btn"
            onClick={() => router.push('/history-order')}
          >
            History Order
          </button>
        </div>

        {/* Footer */}
        <div className="welcome-footer">
          <span className="welcome-footer-text">Developed by </span>
          <span className="welcome-footer-text welcome-footer-held">HELD</span>
        </div>
      </div>
    </ProtectedRoute>
  );
}