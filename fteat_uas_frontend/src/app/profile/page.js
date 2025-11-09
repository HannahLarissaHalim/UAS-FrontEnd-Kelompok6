'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState('/images/profile_dummy.png');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    // Combine firstName and lastName if available
    if (parsedUser.firstName && parsedUser.lastName) {
      parsedUser.name = `${parsedUser.firstName} ${parsedUser.lastName}`;
    }
    setUser(parsedUser);
    
    // Load saved profile image if exists
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }

    // Listen for profile updates from account settings
    const handleUserUpdate = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        const parsedUpdatedUser = JSON.parse(updatedUser);
        if (parsedUpdatedUser.firstName && parsedUpdatedUser.lastName) {
          parsedUpdatedUser.name = `${parsedUpdatedUser.firstName} ${parsedUpdatedUser.lastName}`;
        }
        setUser(parsedUpdatedUser);
      }
      const updatedImage = localStorage.getItem('profileImage');
      if (updatedImage) {
        setProfileImage(updatedImage);
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

  return (
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
        {/* Profile Image - Read Only */}
        <div className="welcome-profile-image">
          <Image 
            src={profileImage} 
            alt="Profile" 
            width={180}
            height={180}
            unoptimized
          />
        </div>

        {/* Name Box */}
        <div className="welcome-name-box">
          <h2 className="welcome-user-name">{user.name || 'Asep Nel Irawelvira'}</h2>
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
  );
}
