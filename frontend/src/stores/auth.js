import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(username, password) {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, {
          username,
          password
        });

        const { token, user } = response.data.data;
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);

        // Set default auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return true;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    async logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    },

    async fetchProfile() {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`);
        this.user = response.data.data.user;
      } catch (error) {
        console.error('Fetch profile error:', error);
        throw error;
      }
    },

    async updateProfile(data) {
      try {
        const response = await axios.put(`${API_URL}/auth/profile`, data);
        this.user = response.data.data.user;
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    }
  }
});
