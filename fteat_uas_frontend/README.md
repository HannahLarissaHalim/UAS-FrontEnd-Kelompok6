# FTEAT - Teknik Rekayasa Rasa

**Food Technology Engineering And Taste** - Platform pemesanan makanan kampus berbasis Next.js dengan React-Bootstrap.

## Deskripsi Project

FTEAT adalah platform pemesanan makanan online yang dirancang khusus untuk mahasiswa Universitas Tarumanagara. Platform ini memudahkan mahasiswa untuk memesan makanan dari berbagai stand di kampus tanpa harus antri lama.

### Fitur Utama:

#### 🎓 **Customer (Mahasiswa)**
- **Register Multi-step**: Pendaftaran dengan auto-generate NPM dan email universitas
- **Login**: Autentikasi menggunakan NPM dan password
- **Browse Menu**: Lihat semua menu dengan filter kategori dan search
- **Add to Cart**: Tambahkan menu ke keranjang dengan opsi tambahan (additionals)
- **Buy Now**: Langsung checkout tanpa keranjang
- **Order Tracking**: Lihat status pesanan (Processing/Done)
- **Order History**: Riwayat semua pesanan

#### **Vendor (Penjual)**
- **Menu Management**: CRUD menu (Create, Read, Update, Delete)
- **Order Management**: Lihat dan ubah status pesanan
- **Sales Report**: Laporan penjualan harian
- **Stock Management**: Kelola stok menu

#### **Halaman Publik**
- **Homepage**: Landing page dengan hero section dan fitur unggulan
- **Stand**: Daftar vendor dan informasi tenant
- **Menu**: Grid menu dengan filter dan search
- **About Us**: Informasi tentang platform

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React-Bootstrap 2.10
- **Language**: JavaScript
- **Styling**: Bootstrap 5.3 + Custom CSS
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js App Router
- **API Integration**: Fetch API dengan environment variables

## Instalasi

### Prerequisites

- Node.js 18+ 
- npm atau yarn

### Langkah Instalasi

1. **Clone repository**
```bash
git clone <repository-url>
cd fteat_uas_frontend
```

2. **Install dependencies**
```bash
npm install
# atau
yarn install
```

3. **Setup environment variables**

Copy file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` sesuai konfigurasi backend Anda:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Run development server**
```bash
npm run dev
# atau
yarn dev
```

5. **Buka browser**
```
http://localhost:3000
```

## Struktur Project

```
fteat_uas_frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── HomeNavbar.js          # Navbar component
│   │   │   └── MenuCard.js            # Menu card component
│   │   ├── about/
│   │   │   └── page.js                # About Us page
│   │   ├── dashboard/
│   │   │   ├── customer/
│   │   │   │   └── page.js            # Customer dashboard
│   │   │   └── vendor/
│   │   │       └── page.js            # Vendor dashboard
│   │   ├── login/
│   │   │   └── page.js                # Login page
│   │   ├── menu/
│   │   │   └── page.js                # Menu page with filters
│   │   ├── order/
│   │   │   └── page.js                # Order confirmation page
│   │   ├── register/
│   │   │   └── page.js                # Multi-step registration
│   │   ├── stand/
│   │   │   └── page.js                # Stand/vendor list page
│   │   ├── layout.js                  # Root layout
│   │   ├── page.js                    # Homepage
│   │   └── globals.css                # Global styles
│   └── utils/
│       ├── api.js                     # API helper functions
│       └── mockData.js                # Mock data for testing
├── public/                             # Static assets
├── .env.example                        # Environment variables example
├── .env.local                          # Local environment variables (gitignored)
├── package.json                        # Dependencies
├── next.config.mjs                     # Next.js configuration
└── README.md                           # Documentation
```

## Alur Autentikasi

### Register (Multi-step)

**Step 1**: Input data mahasiswa
- Nama depan & belakang
- Fakultas (dropdown)
- Jurusan (dropdown - dependent on fakultas)
- Tahun masuk

**Step 2**: Auto-generate NPM & Email
- NPM: `[Kode Fakultas][Kode Jurusan][0][Tahun][3 digit manual]`
  - Contoh: `825250021` (FTI, Sistem Informasi, 0, 2025, 021)
- Email: `[nama.depan].[nama.belakang].[NPM]@stu.untar.ac.id`

**Step 3**: Password
- Input password dan konfirmasi
- Email verifikasi akan dikirim (backend)

### Login
- Input: NPM & Password
- Redirect ke:
  - Customer → `/dashboard/customer`
  - Vendor → `/dashboard/vendor`

## Alur Pemesanan (Customer Flow)

1. **Browse Menu** (`/menu`)
   - Filter by kategori: Instant Noodles, Fritters/Snacks, Bento/Rice, Soup, Beverages
   - Search by keyword

2. **Pilih Menu**
   - Klik "Add to Cart" atau "Buy Now"
   - Modal untuk pilih additionals (opsional)
   - Contoh additionals: Telur 1 (Rp3.000), Telur 2 (Rp5.000), dll

3. **Checkout** (`/order`)
   - Review items & total harga
   - Auto-fill data pemesan (dari login)
   - Confirm Order

4. **Order Status**
   - Processing → vendor sedang menyiapkan
   - Done → siap diambil

5. **Dashboard** (`/dashboard/customer`)
   - Lihat semua order history
   - Status, lokasi pickup, total harga

## Alur Vendor

### Menu Management (`/dashboard/vendor` → Tab "Kelola Menu")
- **Create**: Tambah menu baru (nama, kategori, harga, deskripsi, stok)
- **Read**: Lihat daftar semua menu
- **Update**: Edit menu existing
- **Delete**: Hapus menu

### Order Management (Tab "Pesanan")
- Lihat semua pesanan masuk
- Ubah status dari "Processing" → "Done"
- Lihat detail customer (nama, NPM)

### Sales Report (Tab "Laporan")
- Total pesanan selesai hari ini
- Total pendapatan hari ini

## 🔌 API Integration

API base URL dikonfigurasi via environment variable:

```javascript
// src/utils/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
```

### Endpoints (Backend)

```
POST   /api/auth/register       # Register mahasiswa
POST   /api/auth/login          # Login (NPM + password)
GET    /api/menus               # Get all menus (with filters)
POST   /api/menus               # Create menu (vendor)
PUT    /api/menus/:id           # Update menu
DELETE /api/menus/:id           # Delete menu
POST   /api/orders              # Create order
GET    /api/orders?userId=...   # Get orders by customer
GET    /api/orders?vendorId=... # Get orders by vendor
PATCH  /api/orders/:id/status   # Update order status
GET    /api/vendors             # Get all vendors
GET    /api/vendors/:id/sales   # Get sales report
```

## 🧪 Testing (Mock Data)

Untuk testing frontend tanpa backend, gunakan mock data di `src/utils/mockData.js`:

- `mockFaculties` - Daftar fakultas
- `mockMajors` - Daftar jurusan per fakultas
- `mockVendors` - Daftar vendor
- `mockMenus` - Daftar menu
- `mockOrders` - Contoh order history
- `mockCategories` - Kategori menu

## Design System

### Color Palette
- **Primary**: Bootstrap primary (blue)
- **Success**: Green (vendor dashboard)
- **Warning**: Yellow (processing status)
- **Danger**: Red (cancelled)
- **Info**: Light blue (badges)

### Typography
- Font: Geist Sans (default Next.js)
- Responsive text sizes

### Components
- Responsive navbar dengan mobile hamburger menu
- Cards dengan shadow-sm untuk depth
- Buttons: primary, outline-primary, outline-secondary
- Badges untuk status & kategori
- Modals untuk forms & dialogs
- Tables dengan hover effect

## 📱 Responsive Design

- **Mobile First**: Desain utama untuk mobile (< 768px)
- **Tablet**: Layout 2-kolom (768px - 1024px)
- **Desktop**: Layout multi-kolom dengan sidebar (> 1024px)
- **Navbar**: Collapsible hamburger menu pada mobile

## Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Lint
```bash
npm run lint
```

## Environment Variables

**Jangan commit `.env.local`!** File ini sudah ada di `.gitignore`.

Gunakan `.env.example` sebagai template:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Untuk production, set di hosting platform (Vercel, etc.).

## Todo / Future Enhancements

- [ ] Koneksi real API backend (Node.js + Express + MongoDB)
- [ ] Upload image untuk menu
- [ ] Real-time order notification (WebSocket)
- [ ] Payment gateway integration
- [ ] Rating & review system
- [ ] Push notifications
- [ ] Advanced analytics untuk vendor
- [ ] Multi-language support

## Team

**UAS Frontend Programming - Kelompok 6**

Universitas Tarumanagara  
Fakultas Teknologi Informasi  
Semester 3 - 2024/2025

## License

This project is for educational purposes.

---

**Made with using Next.js & React-Bootstrap**
