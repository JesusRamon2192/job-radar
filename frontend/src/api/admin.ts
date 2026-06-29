import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface AdminUser {
  id: number;
  email: string;
  is_active: boolean;
  is_pro: boolean;
  is_admin: boolean;
  created_at: string;
}

export const getUsers = async (): Promise<AdminUser[]> => {
  const response = await axios.get(`${API_URL}/api/admin/users`);
  return response.data;
};

export const forceEmailSend = async (userId: number): Promise<{ status: string, message: string }> => {
  const response = await axios.post(`${API_URL}/api/admin/users/${userId}/force-email`);
  return response.data;
};

export const deleteUser = async (userId: number): Promise<{ status: string, message: string }> => {
  const response = await axios.delete(`${API_URL}/api/admin/users/${userId}`);
  return response.data;
};
