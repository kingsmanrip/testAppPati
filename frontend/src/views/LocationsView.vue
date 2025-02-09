<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">
        Locations
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
        >
          Add Location
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="locations"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="item.isActive ? 'success' : 'error'"
              size="small"
            >
              {{ item.isActive ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              icon
              size="small"
              color="primary"
              class="mr-2"
              @click="openDialog(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              :color="item.isActive ? 'error' : 'success'"
              @click="toggleLocationStatus(item)"
            >
              <v-icon>{{ item.isActive ? 'mdi-close' : 'mdi-check' }}</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Location Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editMode ? 'Edit Location' : 'Add Location' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" @submit.prevent="handleSubmit">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Location Name"
                  required
                  :rules="[v => !!v || 'Location name is required']"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.address"
                  label="Street Address"
                  required
                  :rules="[v => !!v || 'Address is required']"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="formData.city"
                  label="City"
                  required
                  :rules="[v => !!v || 'City is required']"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="formData.state"
                  label="State"
                  required
                  :rules="[v => !!v || 'State is required']"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                  v-model="formData.zipCode"
                  label="ZIP Code"
                  required
                  :rules="[
                    v => !!v || 'ZIP code is required',
                    v => /^\d{5}(-\d{4})?$/.test(v) || 'Invalid ZIP code'
                  ]"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.notes"
                  label="Notes"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleSubmit"
            :loading="loading"
          >
            {{ editMode ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Location Stats Dialog -->
    <v-dialog v-model="statsDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Location Statistics
        </v-card-title>

        <v-card-text v-if="selectedLocation">
          <v-list>
            <v-list-item>
              <v-list-item-title>Location Name</v-list-item-title>
              <v-list-item-subtitle>{{ selectedLocation.name }}</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>Total Hours Worked</v-list-item-title>
              <v-list-item-subtitle>{{ locationStats.totalHours || 0 }} hours</v-list-item-subtitle>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>Total Entries</v-list-item-title>
              <v-list-item-subtitle>{{ locationStats.totalEntries || 0 }} entries</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="statsDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const API_URL = 'http://localhost:3000/api';
const toast = useToast();

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Address', key: 'address' },
  { title: 'City', key: 'city' },
  { title: 'State', key: 'state' },
  { title: 'ZIP Code', key: 'zipCode' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const locations = ref([]);
const loading = ref(false);
const dialog = ref(false);
const statsDialog = ref(false);
const editMode = ref(false);
const form = ref(null);
const selectedLocation = ref(null);
const locationStats = ref({});

const formData = ref({
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  notes: '',
  isActive: true
});

const resetForm = () => {
  formData.value = {
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
    isActive: true
  };
  editMode.value = false;
};

const openDialog = (location = null) => {
  if (location) {
    editMode.value = true;
    formData.value = { ...location };
  } else {
    resetForm();
  }
  dialog.value = true;
};

const fetchLocations = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_URL}/locations`);
    locations.value = response.data.data.locations;
  } catch (error) {
    toast.error('Failed to fetch locations');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!form.value) return;
  
  const { valid } = await form.value.validate();
  if (!valid) return;

  try {
    loading.value = true;
    if (editMode.value) {
      await axios.put(`${API_URL}/locations/${formData.value.id}`, formData.value);
      toast.success('Location updated successfully');
    } else {
      await axios.post(`${API_URL}/locations`, formData.value);
      toast.success('Location created successfully');
    }
    dialog.value = false;
    fetchLocations();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Operation failed');
  } finally {
    loading.value = false;
  }
};

const toggleLocationStatus = async (location) => {
  try {
    loading.value = true;
    await axios.put(`${API_URL}/locations/${location.id}`, {
      isActive: !location.isActive
    });
    toast.success(`Location ${location.isActive ? 'deactivated' : 'activated'} successfully`);
    fetchLocations();
  } catch (error) {
    toast.error('Failed to update location status');
  } finally {
    loading.value = false;
  }
};

const viewLocationStats = async (location) => {
  try {
    selectedLocation.value = location;
    statsDialog.value = true;
    const response = await axios.get(`${API_URL}/locations/${location.id}/stats`);
    locationStats.value = response.data.data.stats;
  } catch (error) {
    toast.error('Failed to fetch location statistics');
  }
};

onMounted(() => {
  fetchLocations();
});
</script>
