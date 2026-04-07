import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const getAuthToken = () => localStorage.getItem('adminToken');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ── Super admin ────────────────────────────────────────────────────────
export const getAdmins = async () => {
  const response = await api.get('/admin/super/admins');
  return response.data;
};

export const toggleAdminStatus = async (id, isActive) => {
  const response = await api.patch(`/admin/super/admins/${id}/active`, { isActive });
  return response.data;
};

export const activateMembership = async (id) => {
  const response = await api.post(`/admin/super/admins/${id}/activate-membership`);
  return response.data;
};

// ── Auth ───────────────────────────────────────────────────────────────
export const login = async ({ email, password }) => {
  const response = await api.post('/admin/login', { email, password });
  return response.data;
};

export const signup = async (data) => {
  const response = await api.post('/admin/register', data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/admin/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/admin/profile', data);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/admin/forgot-password', { email });
  return response.data;
};

export const resetPassword = async ({ token, password }) => {
  const response = await api.post(`/admin/reset-password/${token}`, { password });
  return response.data;
};

// ── Menú ───────────────────────────────────────────────────────────────
export const uploadImage = async (image) => {
  const formData = new FormData();
  formData.append('image', image);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createMenuItem = async (itemData) => {
  const response = await api.post('/menu/items', itemData);
  return response.data;
};

export const getMenuItems = async () => {
  const response = await api.get('/menu/items');
  return response.data;
};

export const getMenuItemById = async (id) => {
  const response = await api.get(`/menu/items/${id}`);
  return response.data;
};

export const updateMenuItem = async (id, itemData) => {
  const response = await api.put(`/menu/items/${id}`, itemData);
  return response.data;
};

export const deleteMenuItem = async (id) => {
  const response = await api.delete(`/menu/items/${id}`);
  return response.data;
};

export const createMenu = async (menuData) => {
  const response = await api.post('/menu', menuData);
  return response.data;
};

export const getAdminMenu = async () => {
  const response = await api.get('/menu');
  return response.data;
};

export const getPublicMenu = async (uniqueId) => {
  const response = await api.get(`/menu/${uniqueId}`);
  return response.data;
};

export const getQrCode = async (uniqueId) => {
  const response = await api.get(`/menu/qr/${uniqueId}`);
  return response.data;
};

export const regenerateMenuLink = async () => {
  const response = await api.post('/menu/regenerate-link');
  return response.data;
};

export const updateMenuTheme = async (themeData) => {
  const response = await api.put('/menu/theme', themeData);
  return response.data;
};

export const reorderMenuItems = async (items) => {
  const response = await api.put('/menu/items/reorder', { items });
  return response.data;
};

export const getAdminProfile = getProfile;
//lauro 


export default api;
