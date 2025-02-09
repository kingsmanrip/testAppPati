<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h5">
            Time Clock
            <v-spacer></v-spacer>
            <v-chip
              :color="activeEntry ? 'success' : 'error'"
              class="ml-2"
            >
              {{ activeEntry ? 'Clocked In' : 'Clocked Out' }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <v-row align="center" class="mt-4">
              <v-col cols="12" md="6">
                <div class="text-h2 text-center">
                  {{ currentTime }}
                </div>
                <div class="text-subtitle-1 text-center grey--text">
                  {{ currentDate }}
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-if="!activeEntry"
                  v-model="selectedLocation"
                  :items="locations"
                  item-title="name"
                  item-value="id"
                  label="Select Location"
                  :rules="[v => !!v || 'Location is required']"
                ></v-select>

                <div v-else class="text-subtitle-1">
                  <strong>Location:</strong> {{ activeEntry.location?.name }}
                  <br>
                  <strong>Clock In:</strong> {{ formatDateTime(activeEntry.clockIn) }}
                  <br>
                  <template v-if="activeEntry.breakStart && !activeEntry.breakEnd">
                    <strong>Break Started:</strong> {{ formatDateTime(activeEntry.breakStart) }}
                  </template>
                </div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="justify-center pa-4">
            <template v-if="!activeEntry">
              <v-btn
                color="success"
                size="large"
                :loading="loading"
                :disabled="!selectedLocation"
                @click="handleClockIn"
              >
                Clock In
                <v-icon right>mdi-login</v-icon>
              </v-btn>
            </template>
            
            <template v-else>
              <v-btn
                v-if="!activeEntry.breakStart || activeEntry.breakEnd"
                color="warning"
                class="mr-2"
                :loading="loading"
                @click="handleStartBreak"
              >
                Start Break
                <v-icon right>mdi-coffee</v-icon>
              </v-btn>
              
              <v-btn
                v-if="activeEntry.breakStart && !activeEntry.breakEnd"
                color="info"
                class="mr-2"
                :loading="loading"
                @click="handleEndBreak"
              >
                End Break
                <v-icon right>mdi-coffee-off</v-icon>
              </v-btn>

              <v-btn
                color="error"
                :loading="loading"
                @click="handleClockOut"
              >
                Clock Out
                <v-icon right>mdi-logout</v-icon>
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { format } from 'date-fns';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const API_URL = 'http://localhost:3000/api';
const toast = useToast();

const currentTime = ref(format(new Date(), 'HH:mm:ss'));
const currentDate = ref(format(new Date(), 'EEEE, MMMM d, yyyy'));
const selectedLocation = ref(null);
const locations = ref([]);
const activeEntry = ref(null);
const loading = ref(false);
let timer = null;

const updateTime = () => {
  const now = new Date();
  currentTime.value = format(now, 'HH:mm:ss');
  currentDate.value = format(now, 'EEEE, MMMM d, yyyy');
};

const formatDateTime = (date) => {
  return format(new Date(date), 'HH:mm:ss');
};

const fetchLocations = async () => {
  try {
    const response = await axios.get(`${API_URL}/locations`);
    locations.value = response.data.data.locations;
  } catch (error) {
    toast.error('Failed to fetch locations');
  }
};

const fetchCurrentEntry = async () => {
  try {
    const response = await axios.get(`${API_URL}/time-entries/current`);
    activeEntry.value = response.data.data.timeEntry;
  } catch (error) {
    console.error('Error fetching current entry:', error);
  }
};

const handleClockIn = async () => {
  try {
    loading.value = true;
    await axios.post(`${API_URL}/time-entries/clock-in`, {
      locationId: selectedLocation.value
    });
    await fetchCurrentEntry();
    toast.success('Successfully clocked in');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to clock in');
  } finally {
    loading.value = false;
  }
};

const handleClockOut = async () => {
  try {
    loading.value = true;
    await axios.post(`${API_URL}/time-entries/clock-out`);
    activeEntry.value = null;
    toast.success('Successfully clocked out');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to clock out');
  } finally {
    loading.value = false;
  }
};

const handleStartBreak = async () => {
  try {
    loading.value = true;
    await axios.post(`${API_URL}/time-entries/break/start`);
    await fetchCurrentEntry();
    toast.success('Break started');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to start break');
  } finally {
    loading.value = false;
  }
};

const handleEndBreak = async () => {
  try {
    loading.value = true;
    await axios.post(`${API_URL}/time-entries/break/end`);
    await fetchCurrentEntry();
    toast.success('Break ended');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to end break');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  timer = setInterval(updateTime, 1000);
  await Promise.all([
    fetchLocations(),
    fetchCurrentEntry()
  ]);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>
