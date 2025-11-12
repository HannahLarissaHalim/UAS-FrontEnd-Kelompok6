# Vendor Login - Backend Implementation Guide

## 📋 Overview
This document provides complete instructions for the backend team to implement vendor authentication for the FTEat application.

---

## ✅ What's Already Implemented

### Frontend Components
1. **Vendor Welcome Page** (`/vendor-welcome`)
   - Location: `fteat_uas_frontend/src/app/vendor-welcome/page.js`
   - Displays vendor name, email, and action buttons
   - Currently uses dummy data for testing
   - Ready to receive real data from localStorage after login

2. **Choose Login Page** (`/choose-login`)
   - Has "Mahasiswa" and "Vendor" buttons
   - Vendor button currently routes to `/vendor-welcome` (temporary for testing)

3. **API Utility Function**
   - Location: `fteat_uas_frontend/src/utils/api.js`
   - Function: `api.vendorLogin(email, password)`
   - Endpoint: `POST http://localhost:5000/api/vendor/login`
   - Already configured with error handling and logging

### Backend Components (Partially Implemented)
1. **Vendor Model** (`backend/models/Vendor.js`)
   - Has `contact` field for email storage
   - Fields: `_id`, `stallName`, `contact`, `whatsapp`, etc.

2. **Vendor Auth Controller** (`backend/controllers/vendorAuthController.js`)
   - Function: `vendorLogin(req, res, body)`
   - Validates credentials against environment variables
   - Queries MongoDB for vendor data
   - Generates JWT token

3. **Server Routing** (`backend/server.js`)
   - Route registered: `POST /api/vendor/login`
   - Uses vendorAuthController

---

## 🎯 What Backend Team Needs to Do

### Step 1: Create Vendor Login Page (Frontend)

**File to Create:** `fteat_uas_frontend/src/app/vendor-login/page.js`

```javascript
'use client';
import { useState } from 'react';
import { Form, Alert } from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../custom.css';
import { api } from '../../utils/api';

export default function VendorLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.vendorLogin(formData.email, formData.password);

      if (!data) {
        setError('Tidak dapat terhubung ke server');
        return;
      }

      if (!data.success) {
        setError(data.message || 'Login gagal. Periksa email dan password Anda.');
        return;
      }

      // Save token
      const token = data.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      // Save vendor data
      const vendorData = {
        vendorId: data.data?.vendorId,
        email: data.data?.email,
        vendorName: data.data?.vendorName,
        role: 'vendor',
      };

      localStorage.setItem('user', JSON.stringify(vendorData));

      // Redirect to vendor welcome page
      router.push('/vendor-welcome');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login gagal. Periksa koneksi atau coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Navbar />

      <div className="login-container">
        <div className="login-left">
          <Image
            src="/images/logo.png"
            alt="FTEAT Logo"
            width={500}
            height={500}
            className="login-logo"
            unoptimized
          />
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2 className="login-title">Login Vendor</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="login-form">
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Kata Sandi</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <div className="forgot-password-link mb-3">
                <p>Lupa Kata Sandi? | <Link href="/forgot-password" className="register-link">Klik di sini</Link></p>
              </div>

              <button
                type="submit"
                className="login-btn w-100"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
            </Form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="homepage-footer">
        <p>Developed by <strong>HELD</strong></p>
      </div>
    </div>
  );
}
```

### Step 2: Update Choose Login Page

**File to Update:** `fteat_uas_frontend/src/app/choose-login/page.js`

Change the vendor button from:
```javascript
onClick={() => router.push('/vendor-welcome')}
```

To:
```javascript
onClick={() => router.push('/vendor-login')}
```

### Step 3: Update Vendor Welcome Page

**File to Update:** `fteat_uas_frontend/src/app/vendor-welcome/page.js`

Remove the dummy data and restore authentication check:

```javascript
useEffect(() => {
  // Check if user is logged in and is a vendor
  const user = localStorage.getItem('user');
  if (!user) {
    router.push('/choose-login');
    return;
  }

  const userData = JSON.parse(user);
  if (userData.role !== 'vendor') {
    router.push('/');
    return;
  }

  setVendorData(userData);
}, [router]);
```

### Step 4: Verify Backend Environment Variables

**File:** `backend/.env`

Ensure these variables exist:
```env
VENDOR1_EMAIL=your_vendor_email@gmail.com
VENDOR1_PASS=your_secure_password
VENDOR2_EMAIL=second_vendor@gmail.com  # Optional
VENDOR2_PASS=second_password           # Optional
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
```

### Step 5: Add Vendor to MongoDB

**Collection:** `Vendors`

**Required Document Structure:**
```javascript
{
  "_id": "V001",  // String ID
  "stallName": "Kantin Bursa Lt.7",  // Will be displayed on welcome page
  "contact": "your_vendor_email@gmail.com",  // MUST match VENDOR1_EMAIL
  "whatsapp": "08123456789",
  "bankName": "BCA",
  "accountNumber": "1234567890",
  "accountHolder": "Vendor Name",
  "status": "Available"
}
```

**Important:** The `contact` field MUST match the email in `VENDOR1_EMAIL` environment variable.

### Step 6: Test the Backend Endpoint

**Test with PowerShell:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/vendor/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"your_vendor_email@gmail.com","password":"your_password"}'
```

**Expected Success Response (200):**
```json
{
  "success": true,
  "message": "Login vendor berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "vendor",
    "vendorId": "V001",
    "vendorName": "Kantin Bursa Lt.7",
    "email": "your_vendor_email@gmail.com"
  }
}
```

**Expected Error Responses:**
- **401 Unauthorized:** Wrong email or password
- **404 Not Found:** Vendor not in database (check `contact` field)
- **500 Server Error:** Backend issue (check logs)

---

## 🔧 Backend API Specification

### Endpoint: POST /api/vendor/login

**Request:**
```json
{
  "email": "vendor@example.com",
  "password": "securepassword"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login vendor berhasil",
  "data": {
    "token": "JWT_TOKEN_HERE",
    "role": "vendor",
    "vendorId": "V001",
    "vendorName": "Kantin Bursa Lt.7",
    "email": "vendor@example.com"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Data vendor tidak ditemukan di database"
}
```

---

## 🔐 Security Considerations

1. **Password Storage:** Vendor passwords are stored in `.env` file (not in database)
2. **JWT Token:** Valid for 7 days
3. **CORS:** Already configured for `http://localhost:3000`
4. **No Registration:** Vendors cannot self-register (admin-only)

---

## 📊 Data Flow

```
1. User clicks "Vendor" on Choose Login page
   ↓
2. Redirected to /vendor-login
   ↓
3. User enters email and password
   ↓
4. Frontend calls: api.vendorLogin(email, password)
   ↓
5. Backend validates credentials against .env
   ↓
6. Backend queries MongoDB for vendor data using contact field
   ↓
7. Backend generates JWT token
   ↓
8. Backend returns: { token, vendorId, vendorName, email }
   ↓
9. Frontend saves to localStorage
   ↓
10. Frontend redirects to /vendor-welcome
   ↓
11. Welcome page displays vendor info and action buttons
```

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch"
**Cause:** Backend not running or wrong port
**Solution:** Ensure backend is running on port 5000

### Issue: "Email atau password salah"
**Cause:** Credentials don't match .env
**Solution:** Verify VENDOR1_EMAIL and VENDOR1_PASS in .env

### Issue: "Data vendor tidak ditemukan di database"
**Cause:** No vendor document with matching contact field
**Solution:** Add vendor to MongoDB with correct contact email

### Issue: Frontend shows 404 for /vendor-login
**Cause:** Vendor login page not created yet
**Solution:** Create the page using code from Step 1

---

## ✅ Testing Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] .env file has VENDOR1_EMAIL and VENDOR1_PASS
- [ ] MongoDB has vendor document with matching contact field
- [ ] Vendor login page created at /vendor-login
- [ ] Choose login page routes to /vendor-login
- [ ] Can successfully login with test credentials
- [ ] Redirected to /vendor-welcome after login
- [ ] Welcome page shows correct vendor name and email
- [ ] Menu and Pesanan buttons work

---

## 📞 Support

If you encounter issues:
1. Check backend console for error logs
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure MongoDB connection is working
5. Test the API endpoint directly with PowerShell/curl

---

**Last Updated:** November 11, 2025
**Status:** Ready for Backend Implementation
