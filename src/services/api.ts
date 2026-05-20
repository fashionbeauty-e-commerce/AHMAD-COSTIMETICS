import { useAuth } from '../App';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// Helper to get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper to set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Helper to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('token');
};

// Generic API fetch with auth
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error (${url}):`, error);
    throw error;
  }
};

// For backward compatibility with api.js style requests
const request = (endpoint: string, options: RequestInit = {}) => {
    // api.js used endpoints like '/products', but api.ts uses '/api/products'
    // Let's ensure they always have /api prefix if missing
    const fullEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    return apiCall(fullEndpoint, options);
};

// Product API
export const productAPI = {
  create: async (productData: any) => {
    const result = await request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    return result.data.product;
  },

  update: async (id: string, productData: any) => {
    const result = await request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
    return result.data.product;
  },

  delete: async (id: string) => {
    await request(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  getAll: async (params?: any) => {
    const query = new URLSearchParams(params).toString();
    const result = await request(`/products${query ? '?' + query : ''}`);
    return result.data;
  },

  getById: async (id: string) => {
    const result = await request(`/products/${id}`);
    return result.data.product;
  },
  
  search: (query: string, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/products/search/${encodeURIComponent(query)}${queryString ? `?${queryString}` : ''}`);
  },

  addReview: (id: string, data: any) => request(`/products/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Alias for productsAPI (plural) used in api.js
export const productsAPI = productAPI;

// Auth API
export const authAPI = {
  register: async (data: any) => {
    const result = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return result.data;
  },

  login: async (data: any) => {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return result.data;
  },
  
  logout: () => {
    clearAuthToken();
  },

  syncClerk: async (email: string, firstName: string, lastName: string, clerkId: string, imageUrl?: string) => {
    const result = await request('/auth/clerk-sync', {
      method: 'POST',
      body: JSON.stringify({ email, firstName, lastName, clerkId, imageUrl })
    });
    return result.data;
  },

  getMe: async () => {
    const result = await request('/auth/me');
    return result.data.user;
  },
  
  updateProfile: (data: any) => request('/auth/update-profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  changePassword: (data: any) => request('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  forgotPassword: (email: string) => request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  resetPassword: (token: string, password: string) => request(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),
};

// Orders API
export const ordersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id: string) => request(`/orders/${id}`),
  
  create: (data: any) => request('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateStatus: (id: string, data: any) => request(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  cancel: (id: string, reason: string) => request(`/orders/${id}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }),
  
  getMyOrders: () => request('/orders/my/orders'),
};

// Categories API
export const categoriesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/categories${queryString ? `?${queryString}` : ''}`);
  },
  
  getTree: () => request('/categories/tree'),
  
  getById: (id: string) => request(`/categories/${id}`),
  
  create: (data: any) => request('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => request(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => request(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// Messages API (Chat)
export const messagesAPI = {
  getRooms: () => request('/messages/rooms'),
  
  createRoom: (participantId: string) => request('/messages/rooms', {
    method: 'POST',
    body: JSON.stringify({ participantId }),
  }),
  
  getMessages: (roomId: string, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/messages/rooms/${roomId}${queryString ? `?${queryString}` : ''}`);
  },
  
  send: (data: any) => request('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  markAsRead: (id: string) => request(`/messages/${id}/read`, {
    method: 'PUT',
  }),
  
  delete: (id: string) => request(`/messages/${id}`, {
    method: 'DELETE',
  }),
  
  getUnreadCount: () => request('/messages/unread-count'),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/notifications${queryString ? `?${queryString}` : ''}`);
  },
  
  getUnreadCount: () => request('/notifications/unread-count'),
  
  markAsRead: (id: string) => request(`/notifications/${id}/read`, {
    method: 'PUT',
  }),
  
  markAllAsRead: () => request('/notifications/read-all', {
    method: 'PUT',
  }),
  
  delete: (id: string) => request(`/notifications/${id}`, {
    method: 'DELETE',
  }),
};

// Reviews API
export const reviewsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/reviews${queryString ? `?${queryString}` : ''}`);
  },
  
  create: (data: any) => request('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id: string, data: any) => request(`/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: string) => request(`/reviews/${id}`, {
    method: 'DELETE',
  }),
  
  markHelpful: (id: string) => request(`/reviews/${id}/helpful`, {
    method: 'PUT',
  }),
};

// Admin API
export const adminAPI = {
  getStats: () => request('/admin/stats'),
  
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  
  updateUserRole: (id: string, role: string) => request(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  
  toggleUserStatus: (id: string, isActive: boolean) => request(`/admin/users/${id}/activate`, {
    method: 'PUT',
    body: JSON.stringify({ isActive }),
  }),
  
  getRecentOrders: () => request('/admin/orders/recent'),
  
  getAnalytics: () => request('/admin/analytics/sales'),
  
  getDashboardAnalytics: () => request('/analytics/dashboard'),
  
  broadcast: (data: any) => request('/admin/broadcast', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (orderId: string) => request('/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify({ orderId }),
  }),
  
  processPayPal: (data: any) => request('/payments/paypal', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  processMobileMoney: (data: any) => request('/payments/mobile-money', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Get current user from token
export const getCurrentUser = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export default request;
