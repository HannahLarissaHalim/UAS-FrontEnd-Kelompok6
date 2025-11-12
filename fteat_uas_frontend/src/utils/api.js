const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

  // Menu endpoints
  getMenus: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/menus?${queryParams}`);
    return response.json();
  },

  getMenuById: async (id) => {
    const response = await fetch(`${API_URL}/menus/${id}`);
    return response.json();
  },

  createMenu: async (menuData, token) => {
    const response = await fetch(`${API_URL}/menus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(menuData),
    });
    return response.json();
  },

  updateMenu: async (id, menuData, token) => {
    const response = await fetch(`${API_URL}/menus/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(menuData),
    });
    return response.json();
  },

  deleteMenu: async (id, token) => {
    const response = await fetch(`${API_URL}/menus/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // Order endpoints
  createOrder: async (orderData, token) => {
    const response = await fetch(`${API_URL}/orders`, {
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
    const response = await fetch(`${API_URL}/orders?userId=${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getOrdersByVendor: async (vendorId, token) => {
    const response = await fetch(`${API_URL}/orders?vendorId=${vendorId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  updateOrderStatus: async (orderId, status, token) => {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
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
    const response = await fetch(`${API_URL}/vendors`);
    return response.json();
  },

  getSalesReport: async (vendorId, date, token) => {
    const response = await fetch(
      `${API_URL}/vendors/${vendorId}/sales?date=${date}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.json();
  },
};

export default api;
