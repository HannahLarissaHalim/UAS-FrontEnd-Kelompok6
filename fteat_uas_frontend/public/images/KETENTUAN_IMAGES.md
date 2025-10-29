# Image Assets

## ⚠️ PENTING - Logo Belum Ditambahkan!

Project saat ini menggunakan **placeholder** karena file logo belum ada.

## Required Images

Letakkan file gambar berikut di folder ini (`public/images/`):

### 1. logo.png ⚠️ REQUIRED

- **Deskripsi**: Logo FTEAT lengkap (bulat dengan makanan di dalam keranjang)
- **Ukuran**: Minimal 800x800px (untuk kualitas terbaik)
- **Format**: PNG dengan background transparan
- **Digunakan di**:
  - Homepage (ukuran besar 400px di tengah)
  - Navbar brand (ukuran kecil 80px di kiri)

### 2. icon_small.png (Optional)

- **Deskripsi**: Icon kecil untuk hiasan navbar (bisa skip dulu)
- **Ukuran**: 200x200px
- **Format**: PNG dengan background transparan
- **Digunakan di**:
  - Navbar (saat ini dihapus karena menutupi divider)

## Cara Menambahkan Gambar

### Metode 1: Menggunakan Logo Asli (RECOMMENDED)

1. **Save/Download** gambar logo yang Anda kirim di chat
2. **Rename** file menjadi `logo.png` (case-sensitive!)
3. **Copy** file tersebut
4. **Paste** ke folder: `public/images/`
5. **Restart** development server

### Metode 2: Menggunakan Placeholder Sementara

Project sudah include `placeholder-logo.svg` sebagai backup.
Untuk menggunakan placeholder:

- Rename `placeholder-logo.svg` → `logo.png`
- Atau update code untuk gunakan .svg directly

## Catatan

- Jika nama file berbeda, update di:
  - `src/app/components/HomeNavbar.js` (line 14 dan 41)
  - `src/app/page.js` (line 18)
- Format PNG direkomendasikan untuk kualitas terbaik
- Background transparan akan terlihat lebih clean dengan background cream (#FDF8F2)

## Struktur Folder

```
public/
  └── images/
      ├── logo.png    ← Gambar pertama yang Anda kirim
      ├── icon_small.png    ← Gambar kecil untuk navbar
      └── README_IMAGES.md  ← File ini
```

Setelah gambar ditambahkan, restart development server:

```bash
npm run dev
```
