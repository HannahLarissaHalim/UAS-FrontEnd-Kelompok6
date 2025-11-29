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

export const api = { // <-- Named Export (diekspor juga sebagai Default di akhir)
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

  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  login: async (npm, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ npm, password }),
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

  // Vendor endpoints
  vendorRegister: async (vendorData) => {
    const response = await fetch(`${API_URL}/api/vendor/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData),
    });
    return response.json();
  },

  vendorLogin: async (email, password) => {
    const response = await fetch(`${API_URL}/api/vendor/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  getVendors: async () => { // Frontend fetch vendor list
    const response = await fetch(`${API_URL}/api/vendors`);
    return response.json();
  },

  // admin endpoints

  loginAdmin: async (email, password) => {
    try {
      const url = `${API_URL}/api/admin/login`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        throw new Error("Backend tidak mengembalikan format JSON.");
      }

      return response.json();
    } catch (error) {
      console.error("Admin login API error:", error);
      throw error;
    }
  },

  getVendorsForAdmin: async (token) => { // <- baru untuk admin lihat daftar vendor
    const response = await fetch(`${API_URL}/api/vendor/admin/vendors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  approveVendor: async (vendorId, token) => { // <- perlu diperbaiki agar menerima isApprovedValue
    const response = await fetch(`${API_URL}/api/vendor/admin/vendors/${vendorId}/approve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isApproved: true }), // <-- BARIS INI HARUS DINAMIS
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
    const url = `${API_URL}/api/orders/create`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      // handle non-JSON response gracefully
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        return { success: false, message: text || 'Non-JSON response from server' };
      }

      return await response.json();
    } catch (err) {
      console.error('createOrder API error:', err);
      // Return structured error so frontend can show a useful message instead of throwing
      return { success: false, message: err.message || 'Failed to create order', error: String(err) };
    }
  },

  getOrdersByUser: async (userId, token) => {
    try {
      const url = `${API_URL}/api/orders/user/${encodeURIComponent(userId)}`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });

      console.log('[api.getOrdersByUser] url=', url, 'status=', response.status, 'ok=', response.ok);

      const contentType = response.headers.get('content-type') || '';
      let parsed;
      if (contentType.includes('application/json')) {
        try {
          parsed = await response.json();
        } catch (e) {
          const text = await response.text().catch(() => '');
          console.error('[api.getOrdersByUser] failed to parse JSON, text=', text, 'err=', e);
          return { success: false, message: 'Failed to parse JSON response', raw: text };
        }
      } else {
        const text = await response.text().catch(() => '');
        console.error('[api.getOrdersByUser] non-JSON response:', text);
        return { success: false, message: text || 'Non-JSON response from server' };
      }

      // Normalize response shape: ensure we always return an object with `success` and `data` fields
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Invalid response format', raw: parsed };
      }
      if (typeof parsed.success === 'undefined') parsed.success = response.ok;
      return parsed;
    } catch (err) {
      console.error('getOrdersByUser API error:', err);
      return { success: false, message: err.message || 'Failed to fetch user orders', error: String(err) };
    }
  },

  getOrdersByVendor: async (vendorId, token) => {
    try {
      const url = `${API_URL}/api/orders/vendor/${encodeURIComponent(vendorId)}`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });

      console.log('[api.getOrdersByVendor] url=', url, 'status=', response.status, 'ok=', response.ok);

      const contentType = response.headers.get('content-type') || '';
      let parsed;
      if (contentType.includes('application/json')) {
        try {
          parsed = await response.json();
        } catch (e) {
          const text = await response.text().catch(() => '');
          console.error('[api.getOrdersByVendor] failed to parse JSON, text=', text, 'err=', e);
          return { success: false, message: 'Failed to parse JSON response', raw: text };
        }
      } else {
        const text = await response.text().catch(() => '');
        console.error('[api.getOrdersByVendor] non-JSON response:', text);
        return { success: false, message: text || 'Non-JSON response from server' };
      }

      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Invalid response format', raw: parsed };
      }
      if (typeof parsed.success === 'undefined') parsed.success = response.ok;
      return parsed;
    } catch (err) {
      console.error('getOrdersByVendor API error:', err);
      return { success: false, message: err.message || 'Failed to fetch vendor orders', error: String(err) };
    }
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

  verifyOrder: async (orderId, vendorIdentifier, token) => {
    try {
      const url = `${API_URL}/api/orders/${orderId}/verify`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ vendorId: vendorIdentifier }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('verifyOrder non-JSON response:', text);
        return { success: false, message: text || 'Non-JSON response from server' };
      }

      return await response.json();
    } catch (err) {
      console.error('verifyOrder API error:', err);
      return { success: false, message: err.message || 'Failed to verify order', error: String(err) };
    }
  },

  cancelOrderVerification: async (orderId, token) => {
    try {
      const url = `${API_URL}/api/orders/${orderId}/cancel-verification`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('cancelOrderVerification non-JSON response:', text);
        return { success: false, message: text || 'Non-JSON response from server' };
      }

      return await response.json();
    } catch (err) {
      console.error('cancelOrderVerification API error:', err);
      return { success: false, message: err.message || 'Failed to cancel verification', error: String(err) };
    }
  },

  // Vendor endpoints
  getVendors: async () => {
    const response = await fetch(`${API_URL}/api/vendors`);
    return response.json();
  },

  updateVendorProfile: async (profileData, token) => {
    const response = await fetch(`${API_URL}/api/vendor/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
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



export default api; // <-- Default Export (Ini yang dipanggil di page.js sekarang)