# FTEAT Backend API

Backend server untuk aplikasi FTEAT Food Ordering System dengan Node.js, Express, dan MongoDB.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` ke `.env` dan sesuaikan dengan konfigurasi MongoDB Anda:
```bash
cp .env.example .env
```

Edit file `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fteat_db
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
NODE_ENV=development
```

**Ganti `MONGODB_URI`** dengan connection string MongoDB Anda jika menggunakan MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fteat_db
```

### 3. Start Server

Development mode (dengan auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "firstName": "Silvana",
  "lastName": "Budianto",
  "faculty": "Fakultas Teknologi Informasi",
  "major": "825",
  "yearEntry": 2025,
  "npmLast3Digits": "122",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "userId": "...",
    "npm": "825250122",
    "email": "silvana.825250122@stu.untar.ac.id",
    "firstName": "Silvana",
    "lastName": "Budianto",
    "role": "customer",
    "token": "..."
  }
}
```

#### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "npm": "825250122",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "userId": "...",
    "npm": "825250122",
    "email": "silvana.825250122@stu.untar.ac.id",
    "firstName": "Silvana",
    "lastName": "Budianto",
    "role": "customer",
    "token": "..."
  }
}
```

#### Get Current User
```
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

## NPM Generation Logic

NPM (Nomor Pokok Mahasiswa) dihasilkan dengan format:
```
[Faculty+MajorFirst2](3) + [MajorLast2](2) + [0](1) + [Year](2) + [Last3Digits](3)
```

Contoh:
- Major Code: `825` (Sistem Informasi)
- Year Entry: `2025`
- Last 3 Digits: `122`
- NPM: `825` + `25` + `0` + `25` + `122` = **825250122**

## Major Codes (dari mockData)

### Fakultas Teknologi Informasi
- `535` - Teknik Informatika
- `825` - Sistem Informasi

### Fakultas Ekonomi dan Bisnis
- `115` - Manajemen
- `125` - Akuntansi

### Fakultas Teknik
- `325` - Teknik Sipil
- `515` - Teknik Mesin
- `315` - Arsitektur
- `345` - Perencanaan Wilayah & Tata Kota
- `525` - Teknik Elektro
- `545` - Teknik Industri

## Database Schema

### User Model
```javascript
{
  firstName: String (required),
  lastName: String (optional),
  faculty: String (required),
  major: String (required),
  yearEntry: Number (required),
  npm: String (required, unique, 9 digits),
  email: String (required, unique, format: name.npm@stu.untar.ac.id),
  password: String (required, hashed, min 6 chars),
  role: String (customer/vendor/admin, default: customer),
  isVerified: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

API menggunakan format response standar:

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "...",
  "errors": [ ... ]
}
```

## Security Features

- Password hashing dengan bcryptjs
- JWT authentication
- Input validation dengan express-validator
- CORS protection
- MongoDB injection prevention

## Testing

Gunakan Postman atau Thunder Client untuk test API endpoints.
Contoh collection tersedia di dokumentasi.
