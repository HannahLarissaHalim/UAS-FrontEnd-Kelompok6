const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  // Auth endpoints
  login: async (npm, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ npm, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
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
