import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useLocationStore = defineStore('location', {
  state: () => ({
    locations: [],
    activeLocations: [],
    loading: false,
    error: null
  }),

  getters: {
    getLocationById: (state) => (id) => {
      return state.locations.find(location => location.id === id);
    },
    getActiveLocations: (state) => {
      return state.locations.filter(location => location.isActive);
    }
  },

  actions: {
    async fetchLocations() {
      try {
        this.loading = true;
        const response = await axios.get(`${API_URL}/locations`);
        this.locations = response.data.data.locations;
        this.activeLocations = this.locations.filter(location => location.isActive);
        return this.locations;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch locations';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createLocation(locationData) {
      try {
        this.loading = true;
        const response = await axios.post(`${API_URL}/locations`, locationData);
        const newLocation = response.data.data.location;
        this.locations.push(newLocation);
        if (newLocation.isActive) {
          this.activeLocations.push(newLocation);
        }
        return newLocation;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create location';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateLocation(id, locationData) {
      try {
        this.loading = true;
        const response = await axios.put(`${API_URL}/locations/${id}`, locationData);
        const updatedLocation = response.data.data.location;
        
        const index = this.locations.findIndex(loc => loc.id === id);
        if (index !== -1) {
          this.locations[index] = updatedLocation;
        }
        
        // Update active locations
        this.activeLocations = this.locations.filter(location => location.isActive);
        
        return updatedLocation;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update location';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async toggleLocationStatus(id) {
      try {
        const location = this.getLocationById(id);
        if (!location) throw new Error('Location not found');

        const response = await axios.put(`${API_URL}/locations/${id}`, {
          isActive: !location.isActive
        });

        const updatedLocation = response.data.data.location;
        const index = this.locations.findIndex(loc => loc.id === id);
        if (index !== -1) {
          this.locations[index] = updatedLocation;
        }

        // Update active locations
        this.activeLocations = this.locations.filter(location => location.isActive);
        
        return updatedLocation;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to toggle location status';
        throw error;
      }
    },

    async getLocationStats(id) {
      try {
        this.loading = true;
        const response = await axios.get(`${API_URL}/locations/${id}/stats`);
        return response.data.data.stats;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch location statistics';
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
