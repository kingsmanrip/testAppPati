<template>
  <div>
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

      <template v-slot:item.actions="{ item }" v-if="showActions">
        <v-btn
          icon
          size="small"
          color="info"
          class="mr-2"
          @click="$emit('view', item)"
        >
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn
          v-if="isAdmin"
          icon
          size="small"
          color="primary"
          @click="$emit('edit', item)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>

      <template v-slot:bottom>
        <div class="text-right pa-2">
          <strong>Total Hours:</strong> {{ totalHours.toFixed(2) }}
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  timeEntries: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: false
  }
});

defineEmits(['view', 'edit']);

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const headers = computed(() => {
  const baseHeaders = [
    { title: 'Date', key: 'clockIn', sortable: true },
    { title: 'Clock In', key: 'clockIn', sortable: true },
    { title: 'Clock Out', key: 'clockOut', sortable: true },
    { title: 'Total Hours', key: 'totalHours', sortable: true },
    { title: 'Break Duration', key: 'breakDuration', sortable: true },
    { title: 'Location', key: 'location', sortable: true }
  ];

  if (props.showActions) {
    baseHeaders.push({ title: 'Actions', key: 'actions', sortable: false });
  }

  return baseHeaders;
});

const totalHours = computed(() => {
  return props.timeEntries.reduce((total, entry) => total + (entry.totalHours || 0), 0);
});

const formatDateTime = (date) => {
  return format(new Date(date), 'MMM d, yyyy HH:mm');
};
</script>
