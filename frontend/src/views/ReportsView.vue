<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">
        Time Reports
        <v-spacer></v-spacer>
        <v-row class="mt-2">
          <v-col cols="12" sm="4">
            <v-select
              v-model="selectedRange"
              :items="dateRanges"
              label="Date Range"
              @update:model-value="updateDateRange"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="startDate"
              label="Start Date"
              type="date"
              @update:model-value="fetchTimeEntries"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="endDate"
              label="End Date"
              type="date"
              @update:model-value="fetchTimeEntries"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="timeEntries"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.clockIn="{ item }">
            {{ formatDateTime(item.clockIn) }}
          </template>
          <template v-slot:item.clockOut="{ item }">
            {{ item.clockOut ? formatDateTime(item.clockOut) : '-' }}
          </template>
          <template v-slot:item.totalHours="{ item }">
            {{ item.totalHours?.toFixed(2) || '-' }}
          </template>
          <template v-slot:item.breakDuration="{ item }">
            {{ item.breakDuration ? `${item.breakDuration} min` : '-' }}
          </template>
          <template v-slot:item.location="{ item }">
            {{ item.location?.name || '-' }}
          </template>
        </v-data-table>

        <v-card class="mt-4 pa-4">
          <v-row>
            <v-col cols="12" sm="4">
              <div class="text-h6">Total Hours</div>
              <div class="text-body-1">{{ totalHours.toFixed(2) }}</div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="text-h6">Total Days</div>
              <div class="text-body-1">{{ totalDays }}</div>
            </v-col>
            <v-col cols="12" sm="4">
              <div class="text-h6">Average Hours/Day</div>
              <div class="text-body-1">{{ averageHoursPerDay.toFixed(2) }}</div>
            </v-col>
          </v-row>
        </v-card>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const API_URL = 'http://localhost:3000/api';
const toast = useToast();

const headers = [
  { title: 'Date', key: 'clockIn', sortable: true },
  { title: 'Clock In', key: 'clockIn', sortable: true },
  { title: 'Clock Out', key: 'clockOut', sortable: true },
  { title: 'Total Hours', key: 'totalHours', sortable: true },
  { title: 'Break Duration', key: 'breakDuration', sortable: true },
  { title: 'Location', key: 'location', sortable: true }
];

const dateRanges = [
  { title: 'Today', value: 'today' },
  { title: 'Last 7 Days', value: 'week' },
  { title: 'Last 30 Days', value: 'month' },
  { title: 'Custom', value: 'custom' }
];

const selectedRange = ref('week');
const startDate = ref(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
const endDate = ref(format(new Date(), 'yyyy-MM-dd'));
const timeEntries = ref([]);
const loading = ref(false);

const totalHours = computed(() => {
  return timeEntries.value.reduce((total, entry) => total + (entry.totalHours || 0), 0);
});

const totalDays = computed(() => {
  const uniqueDays = new Set(
    timeEntries.value.map(entry => format(new Date(entry.clockIn), 'yyyy-MM-dd'))
  );
  return uniqueDays.size;
});

const averageHoursPerDay = computed(() => {
  return totalDays.value ? totalHours.value / totalDays.value : 0;
});

const formatDateTime = (date) => {
  return format(new Date(date), 'MMM d, yyyy HH:mm');
};

const updateDateRange = () => {
  const today = new Date();
  switch (selectedRange.value) {
    case 'today':
      startDate.value = format(today, 'yyyy-MM-dd');
      endDate.value = format(today, 'yyyy-MM-dd');
      break;
    case 'week':
      startDate.value = format(subDays(today, 7), 'yyyy-MM-dd');
      endDate.value = format(today, 'yyyy-MM-dd');
      break;
    case 'month':
      startDate.value = format(subDays(today, 30), 'yyyy-MM-dd');
      endDate.value = format(today, 'yyyy-MM-dd');
      break;
  }
  fetchTimeEntries();
};

const fetchTimeEntries = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_URL}/time-entries`, {
      params: {
        startDate: startDate.value,
        endDate: endDate.value
      }
    });
    timeEntries.value = response.data.data.timeEntries;
  } catch (error) {
    toast.error('Failed to fetch time entries');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTimeEntries();
});
</script>
