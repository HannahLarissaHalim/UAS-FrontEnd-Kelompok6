// app/utils/mockData.js

// Faculty tidak punya kode, hanya nama
export const mockFaculties = [
    { name: 'Fakultas Ekonomi dan Bisnis' },
    { name: 'Fakultas Hukum' },
    { name: 'Fakultas Teknik' },
    { name: 'Fakultas Psikologi' },
    { name: 'Fakultas Ilmu Komunikasi' },
    { name: 'Fakultas Kedokteran' },
    { name: 'Fakultas Seni Rupa dan Desain' },
    { name: 'Fakultas Teknologi Informasi' },
  ];
  
  // Key menggunakan nama fakultas, value adalah array program studi dengan kode 3 digit
  export const mockMajors = {
    'Fakultas Ekonomi dan Bisnis': [
      { code: '115', name: 'Manajemen' },
      { code: '125', name: 'Akuntansi' },
    ],
    'Fakultas Hukum': [
      { code: '205', name: 'Hukum' },
    ],
    'Fakultas Teknik': [
      { code: '325', name: 'Teknik Sipil' },
      { code: '515', name: 'Teknik Mesin' },
      { code: '315', name: 'Arsitektur' },
      { code: '345', name: 'Perencanaan Wilayah & Tata Kota' },
      { code: '525', name: 'Teknik Elektro' },
      { code: '545', name: 'Teknik Industri' },
    ],
    'Fakultas Psikologi': [
      { code: '705', name: 'Psikologi' },
    ],
    'Fakultas Ilmu Komunikasi': [
      { code: '915', name: 'Ilmu Komunikasi' },
    ],
    'Fakultas Kedokteran': [
      { code: '405', name: 'Kedokteran' },
    ],
    'Fakultas Seni Rupa dan Desain': [
      { code: '625', name: 'Desain Komunikasi Visual' },
      { code: '615', name: 'Desain Interior' },
    ],
    'Fakultas Teknologi Informasi': [
      { code: '535', name: 'Teknik Informatika' },
      { code: '825', name: 'Sistem Informasi' },
    ],
  };
  

  export const mockVendors = []; 
  export const mockOrders = []; 
  export const mockMenus = []; 
  
  export const mockCategories = [
    "Instant Noodles",
    "Fritters / Snacks",
    "Bento / Rice",
    "Soup",
    "Beverages",
  ];