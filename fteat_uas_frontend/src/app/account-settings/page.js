'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { api } from '../../utils/api';
import ProtectedRoute from '../components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import '/accountsettings.css';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState('/images/profile_dummy.png');
  const [tempProfileImage, setTempProfileImage] = useState(null); // Temporary image preview
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
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

    if (parsedUser.profileImage) {
      setProfileImage(parsedUser.profileImage);
    }
  }, [router]);

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  // Fungsi untuk kompres gambar
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = document.createElement('img');
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Ukuran maksimal
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;
          
          // Hitung proporsi
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert ke base64 dengan quality 0.7
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    try {
      // Kompres gambar dan set sebagai temporary preview
      const compressedImage = await compressImage(file);
      setTempProfileImage(compressedImage);
      setProfileImage(compressedImage); // Update preview
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Terjadi kesalahan saat memproses gambar');
    }
  };

  const handleSave = async () => {
    setUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Sesi kamu telah habis. Silahkan login kembali');
        router.push('/login');
        return;
      }

      // Validasi nickname
      if (!formData.nickname || formData.nickname.trim() === '') {
        alert('Nickname tidak boleh kosong');
        setUploading(false);
        return;
      }

      // Update nickname
      const nicknameResponse = await api.updateNickname(formData.nickname.trim(), token);

      if (!nicknameResponse.success) {
        alert(nicknameResponse.message || 'Gagal menyimpan nickname');
        setUploading(false);
        return;
      }

      let finalUser = nicknameResponse.data;

      // Upload profile image jika ada perubahan
      if (tempProfileImage) {
        const imageResponse = await api.updateProfileImage(tempProfileImage, token);

        if (!imageResponse.success) {
          alert(imageResponse.message || 'Gagal menyimpan foto profil');
          setUploading(false);
          return;
        }

        finalUser = imageResponse.data;
        setTempProfileImage(null); // Clear temporary image
      }

      // Update localStorage dengan data terbaru
      const fullName = finalUser.lastName 
        ? `${finalUser.firstName} ${finalUser.lastName}` 
        : finalUser.firstName;
      
      const updatedUser = {
        userId: finalUser._id,
        npm: finalUser.npm,
        email: finalUser.email,
        firstName: finalUser.firstName,
        lastName: finalUser.lastName,
        nickname: finalUser.nickname, 
        displayName: finalUser.nickname || fullName,
        profileImage: finalUser.profileImage,
        role: finalUser.role,
        faculty: finalUser.faculty,
        major: finalUser.major,
        name: fullName
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Trigger event untuk update navbar dan profile page
      window.dispatchEvent(new Event('userUpdated'));

      alert('Profil telah diperbarui');
      router.push('/profile');

    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menyimpan profil');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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

        {/* Back Button */}
        <button 
          className="back-button"
          onClick={() => router.push('/profile')}
          aria-label="Back to profile"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#0A4988" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>

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
              <img 
                src={profileImage} 
                alt="Profile" 
                style={{ width: '180px', height: '179px', objectFit: 'cover', borderRadius: '50%' }}
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
          <button 
            className="account-btn-save" 
            onClick={handleSave}
            disabled={uploading}
          >
            {uploading ? 'Saving' : 'Save'}
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