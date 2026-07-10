import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface UserProfile {
  id: number;
  email: string;
  is_pro: boolean;
  is_admin?: boolean;
  profile_config?: Record<string, any>;
}

export const registerUser = async (email: string, password: string): Promise<{access_token: string, token_type: string}> => {
  const response = await axios.post(`${API_URL}/api/auth/register`, { email, password });
  return response.data;
};

export const loginUser = async (email: string, password: string): Promise<{access_token: string, token_type: string}> => {
  // OAuth2PasswordRequestForm requires data to be sent as x-www-form-urlencoded
  const formData = new URLSearchParams();
  formData.append('username', email); // OAuth2 expects 'username'
  formData.append('password', password);
  
  const response = await axios.post(`${API_URL}/api/auth/login`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
};

export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await axios.get(`${API_URL}/api/auth/me`);
  return response.data;
};

export const updateProfileConfig = async (profileConfig: Record<string, any>): Promise<UserProfile> => {
  const response = await axios.put(`${API_URL}/api/auth/me`, { profile_config: profileConfig });
  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{message: string}> => {
  const response = await axios.put(`${API_URL}/api/auth/change-password`, {
    current_password: currentPassword,
    new_password: newPassword
  });
  return response.data;
};

export const forgotPassword = async (email: string): Promise<{message: string}> => {
  const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string): Promise<{message: string}> => {
  const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
    token,
    new_password: newPassword
  });
  return response.data;
};
