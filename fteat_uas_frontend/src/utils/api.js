const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

//Debug
console.log('=== API CONFIGURATION ===');
console.log('process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Configured API_URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
console.log('========================');

// Debug: Log API URL on initialization
if (typeof window !== 'undefined') {
  console.log('API_URL configured as:', API_URL);
}

export const api = {
  // User endpoints
  deleteAccount: async (token) => {
    const response = await fetch(`${API_URL}/api/users/delete-account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateNickname: async (nickname, token) => {
    const response = await fetch(`${API_URL}/api/users/update-nickname`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ nickname }),
    });
    return response.json();
  },

  updateProfileImage: async (profileImage, token) => {
    const response = await fetch(`${API_URL}/api/users/update-profile-image`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ profileImage }),
    });
    return response.json();
  },

  // Auth endpoints
  login: async (npm, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ npm, password }),
    });
    return response.json();
  },

  vendorLogin: async (email, password) => {
    try {
      const url = `${API_URL}/api/vendor/login`;
      console.log('Attempting vendor login to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error('Server returned non-JSON response. Check if backend is running correctly.');
      }
      
      return response.json();
    } catch (error) {
      console.error('Vendor login API error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  /* PASSWORD RESET ENDPOINTS */

  // Forgot password → User minta email reset
  requestResetPassword: async (email) => {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  // Change password via token → Halaman change-password/[token]
  changePassword: async (token, newPassword) => {
    const response = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    return response.json();
  },

  // Menu endpoints
  getMenus: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/api/menus?${queryParams}`);
    return response.json();
  },

  getMenuById: async (id) => {
    const response = await fetch(`${API_URL}/api/menus/${id}`);
    return response.json();
  },

 getMenusByVendor: async (vendorId) => {
    try {
      const url = `${API_URL}/api/menus/vendor/${encodeURIComponent(vendorId)}`;
       //debug
      console.log('=== GET MENUS BY VENDOR API CALL ===');
      console.log('Full URL:', url);
      console.log('Vendor ID:', vendorId);
      console.log('Encoded Vendor ID:', encodeURIComponent(vendorId));
      
      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response URL:', response.url);
      
      const result = await response.json();
      console.log('Response data:', result);
      console.log('Number of menus:', result.data?.length || 0);
      
      return result;
    } catch (error) {
      console.error('Get menus by vendor API error:', error);
      throw error;
    }
  },

createMenu: async (menuData, token) => {
  try {
    const url = `${API_URL}/api/menus`;
    //debug
    console.log('=== CREATE MENU API CALL ===');
    console.log('URL:', url);
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('Menu data:', JSON.stringify(menuData, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(menuData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const result = await response.json();
    console.log('Response data:', result);
    
    if (result.success && result.data) {
      console.log('Created menu ID:', result.data._id);
      console.log('Created menu vendor:', result.data.vendor);
    }
    
    return result;
  } catch (error) {
    console.error('Create menu API error:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
},

  updateMenu: async (id, menuData, token) => {
    try {
      const url = `${API_URL}/api/menus/${id}`;
       //debug
      console.log('=== UPDATE MENU API CALL ===');
      console.log('URL:', url);
      console.log('Menu ID:', id);
      console.log('Update data:', JSON.stringify(menuData, null, 2));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(menuData),
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      return result;
    } catch (error) {
      console.error('Update menu API error:', error);
      throw error;
    }
  },

  deleteMenu: async (id, token) => {
    const response = await fetch(`${API_URL}/api/menus/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  deleteMultipleMenus: async (menuIds, token) => {
    const response = await fetch(`${API_URL}/api/menus/delete-multiple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ menuIds }),
    });
    return response.json();
  },

 getMenusByVendor: async (vendorId) => {
  try {
    // URL encode the vendor ID to handle spaces and special characters
    const encodedVendorId = encodeURIComponent(vendorId);
    const url = `${API_URL}/api/menus/vendor/${encodedVendorId}`;
     //debug
    console.log('=== GET MENUS BY VENDOR API CALL ===');
    console.log('API_URL:', API_URL);
    console.log('Original Vendor ID:', vendorId);
    console.log('Encoded Vendor ID:', encodedVendorId);
    console.log('Full URL:', url);
    
    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response received:', text);
      throw new Error('Server returned non-JSON response');
    }
    
    const result = await response.json();
    console.log('Response data:', result);
    console.log('Number of menus:', result.data?.length || 0);
    
    if (result.data && result.data.length > 0) {
      console.log('First menu sample:', result.data[0]);
    }
    
    return result;
  } catch (error) {
    console.error('Get menus by vendor API error:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
},

  updateStockStatus: async (id, stock, token) => {
    try {
      const url = `${API_URL}/api/menus/${id}/stock`;
       //debug
      console.log('=== UPDATE STOCK STATUS API CALL ===');
      console.log('URL:', url);
      console.log('Menu ID:', id);
      console.log('New stock status:', stock);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ stock }),
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      return result;
    } catch (error) {
      console.error('Update stock status API error:', error);
      throw error;
    }
  },

  // Order endpoints
  createOrder: async (orderData, token) => {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    return response.json();
  },

  getOrdersByUser: async (userId, token) => {
    const response = await fetch(`${API_URL}/api/orders?userId=${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getOrdersByVendor: async (vendorId, token) => {
    const response = await fetch(`${API_URL}/api/orders?vendorId=${vendorId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  updateOrderStatus: async (orderId, status, token) => {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  // Vendor endpoints
  getVendors: async () => {
    const response = await fetch(`${API_URL}/api/vendors`);
    return response.json();
  },

  getSalesReport: async (vendorId, date, token) => {
    const response = await fetch(
      `${API_URL}/api/vendors/${vendorId}/sales?date=${date}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.json();
  },
};

export default api;
