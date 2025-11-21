/** @type {import('next').NextConfig} */
const nextConfig = {
  // Opsi ini akan mengaktifkan mode strict concurrency rendering
  // Disarankan untuk proyek baru.
  reactStrictMode: true, 
  
  // Mengaktifkan penggunaan folder 'images' sebagai asset statis
  images: {
    // Jika Anda mengimpor gambar dari luar (misal Cloudinary), tambahkan domain di sini:
    // domains: ['res.cloudinary.com'],
  },
  
  // Opsi untuk menyembunyikan X-Powered-By: Next.js header
  poweredByHeader: false,
  
  // Opsi untuk custom webpack config (jika dibutuhkan)
  // webpack: (config, { isServer }) => {
  //   return config;
  // },

  // JANGAN masukkan 'experiments' atau kunci yang tidak didukung di sini
};

module.exports = nextConfig;