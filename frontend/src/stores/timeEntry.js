import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useTimeEntryStore = defineStore('timeEntry', {
  state: () => ({
    currentEntry: null,
    timeEntries: [],
    loading: false,
    error: null
  }),

  getters: {
    isClockedIn: (state) => !!state.currentEntry,
    isOnBreak: (state) => state.currentEntry?.breakStart && !state.currentEntry?.breakEnd,
    totalHours: (state) => state.timeEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0)
  },

  actions: {
    async fetchCurrentEntry() {
      try {
        this.loading = true;
        const response = await axios.get(`${API_URL}/time-entries/current`);
        this.currentEntry = response.data.data.timeEntry;
        return this.currentEntry;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch current entry';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchTimeEntries(params = {}) {
      try {
        this.loading = true;
        const response = await axios.get(`${API_URL}/time-entries`, { params });
        this.timeEntries = response.data.data.timeEntries;
        return this.timeEntries;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch time entries';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async clockIn(locationId) {
      try {
        this.loading = true;
        const response = await axios.post(`${API_URL}/time-entries/clock-in`, { locationId });
        this.currentEntry = response.data.data.timeEntry;
        return this.currentEntry;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to clock in';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async clockOut(notes = '') {
      try {
        this.loading = true;
        const response = await axios.post(`${API_URL}/time-entries/clock-out`, { notes });
        this.currentEntry = null;
        return response.data.data.timeEntry;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to clock out';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async startBreak() {
      try {
        this.loading = true;
        const response = await axios.post(`${API_URL}/time-entries/break/start`);
        this.currentEntry = response.data.data.timeEntry;
        return this.currentEntry;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to start break';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async endBreak() {
      try {
        this.loading = true;
        const response = await axios.post(`${API_URL}/time-entries/break/end`);
        this.currentEntry = response.data.data.timeEntry;
        return this.currentEntry;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to end break';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    }
  }
});
