'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { api } from '../../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState('/images/profile_dummy.png');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '••••••••'
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    
    // Combine firstName and lastName for display
    if (parsedUser.firstName && parsedUser.lastName) {
      parsedUser.name = `${parsedUser.firstName} ${parsedUser.lastName}`;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(parsedUser);

    // Set nickname dari data user
    // Biarkan kosong jika memang belum ada nickname
    const displayNickname = parsedUser.nickname || '';
    
    setFormData({
      nickname: displayNickname,
      email: parsedUser.email || `${parsedUser.npm}@stu.untar.ac.id`,
      password: 'asepasep'
    });

    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, [router]);

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setProfileImage(imageData);
        localStorage.setItem('profileImage', imageData);
        // Dispatch event to update navbar and other components
        window.dispatchEvent(new Event('userUpdated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Sesi kamu telah habis. Silahkan login kembali');
        router.push('/login');
        return;
      }

      // Validasi nickname tidak boleh kosong
      if (!formData.nickname || formData.nickname.trim() === '') {
        alert('Nickname tidak boleh kosong');
        return;
      }

      // Update nickname ke backend
      const response = await api.updateNickname(formData.nickname.trim(), token);

      if (response.success) {
        // Update dengan data dari server response
        const serverUser = response.data;
        
        // Build full name
        const fullName = serverUser.lastName 
          ? `${serverUser.firstName} ${serverUser.lastName}` 
          : serverUser.firstName;
        
        // Create updated user object dengan semua field dari server
        const updatedUser = {
          userId: serverUser._id,
          npm: serverUser.npm,
          email: serverUser.email,
          firstName: serverUser.firstName,
          lastName: serverUser.lastName,
          nickname: serverUser.nickname, 
          displayName: serverUser.nickname || fullName, 
          role: serverUser.role,
          faculty: serverUser.faculty,
          major: serverUser.major,
          name: fullName 
        };
        
        // Save updated data ke localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        // Dispatch event untuk update komponen lain
        window.dispatchEvent(new Event('userUpdated'));

        alert('Nickname berhasil disimpan!');
        
        router.push('/profile');
      } else {
        alert(response.message || 'Gagal menyimpan nickname');
      }
    } catch (error) {
      console.error('Error saving nickname:', error);
      alert('Terjadi kesalahan saat menyimpan nickname');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('profileImage');
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    if (confirm('Apakah kamu yakin untuk menghapus akun ini? Akunmu tidak akan bisa dikembalikan')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Kamu tidak memiliki akun. Harap login untuk menghapus akun');
          router.push('/login');
          return;
        }

        const response = await api.deleteAccount(token);

        if (response.success) {
          // Clear all local storage data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('profileImage');

          alert('Akunmu telah berhasil dihapus');
          router.push('/register');
        } else {
          alert(response.message || 'Gagal untuk menghapus akun');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error terjadi saat menghapus akunmu, Coba lagi nanti');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="account-settings-page">
        <Navbar />

        {/* Background Logo */}
        <div className="account-bg-logo">
          <Image 
            src="/images/logo.png" 
            alt="FTEat Logo" 
            width={822}
            height={822}
            unoptimized
          />
        </div>

        {/* Account Settings Title */}
        <div className="account-settings-header">
          <svg className="settings-icon" width="68" height="68" viewBox="0 0 68 68" fill="none">
            <path d="M34 42.5C38.6944 42.5 42.5 38.6944 42.5 34C42.5 29.3056 38.6944 25.5 34 25.5C29.3056 25.5 25.5 29.3056 25.5 34C25.5 38.6944 29.3056 42.5 34 42.5Z" stroke="#0A4988" strokeWidth="4"/>
            <path d="M34 8.5V17M34 51V59.5M8.5 34H17M51 34H59.5M14.45 14.45L20.4 20.4M47.6 47.6L53.55 53.55M14.45 53.55L20.4 47.6M47.6 20.4L53.55 14.45" stroke="#0A4988" strokeWidth="4" strokeLinecap="round"/>
          </svg>
          <h1 className="account-settings-title">Account Settings</h1>
        </div>

        {/* Profile Section */}
        <div className="account-profile-section">
          {/* Profile Image with Edit Icon */}
          <div className="account-profile-wrapper">
            <div 
              className="account-profile-image" 
              onClick={handleProfileImageClick}
              title="Click to change profile picture"
            >
              <Image 
                src={profileImage} 
                alt="Profile" 
                width={180}
                height={179}
                unoptimized
              />
            </div>
            <div className="account-profile-edit-icon" onClick={handleProfileImageClick}>
              <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
                <path d="M11 77L29.3333 73.3333L73.3333 29.3333C75.5435 27.1232 76.7778 24.1449 76.7778 21.0417C76.7778 17.9384 75.5435 14.9601 73.3333 12.75C71.1232 10.5399 68.1449 9.30556 65.0417 9.30556C61.9384 9.30556 58.9601 10.5399 56.75 12.75L12.75 56.75L11 77Z" stroke="#27086E" strokeWidth="5.0625" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Nickname Box - Editable */}
          <div className="account-name-box">
            <input
              type="text"
              name="nickname"
              className="account-user-name-input"
              value={formData.nickname}
              onChange={handleInputChange}
              placeholder={user.name || "Enter your nickname"}
            />
          </div>

          {/* Info Box - Read Only */}
          <div className="account-info-box">
            <div className="account-info-row">
              <input
                type="text"
                className="account-info-input"
                value={user.faculty || 'Teknologi Informasi'}
                readOnly
                placeholder="Faculty"
              />
            </div>
            <div className="account-info-row account-info-row-split">
              <input
                type="text"
                className="account-info-npm-input"
                value={user.npm || '535220142'}
                readOnly
                placeholder="NPM"
              />
              <span className="account-info-separator">——</span>
              <input
                type="text"
                className="account-info-program-input"
                value={user.major || 'Teknik Informatika'}
                readOnly
                placeholder="Major"
              />
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="account-form-section">
          {/* Email Field */}
          <div className="account-form-group">
            <label className="account-form-label">Email</label>
            <input
              type="email"
              name="email"
              className="account-form-input"
              value={formData.email}
              onChange={handleInputChange}
              readOnly
            />
          </div>

          {/* Password Field */}
          <div className="account-form-group">
            <label className="account-form-label">Password</label>
            <div className="account-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="account-form-input"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button 
                className="account-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="account-action-buttons">
          <button className="account-btn-logout" onClick={handleLogout}>
            Logout
          </button>
          <button className="account-btn-delete" onClick={handleDeleteAccount}>
            <svg width="33" height="33" viewBox="0 0 33 33" fill="none">
              <path d="M8.25 9.625H24.75M11 9.625V6.875C11 6.34674 11.2107 5.84002 11.5858 5.46495C11.9609 5.08988 12.4674 4.875 13 4.875H20C20.5326 4.875 21.0391 5.08988 21.4142 5.46495C21.7893 5.84002 22 6.34674 22 6.875V9.625M13.75 15.125V22.125M19.25 15.125V22.125M9.625 9.625H23.375V25.625C23.375 26.1533 23.1643 26.66 22.7892 27.0351C22.4141 27.4101 21.9076 27.625 21.375 27.625H11.625C11.0924 27.625 10.5859 27.4101 10.2108 27.0351C9.83571 26.66 9.625 26.1533 9.625 25.625V9.625Z" fill="#FFFFFF"/>
            </svg>
            Delete account
          </button>
          <button className="account-btn-save" onClick={handleSave}>
            Save
          </button>
        </div>

        {/* Footer */}
        <div className="account-footer">
          <span className="account-footer-text">Developed by </span>
          <span className="account-footer-text account-footer-held">HELD</span>
        </div>
      </div>
    </ProtectedRoute>
  );
}
