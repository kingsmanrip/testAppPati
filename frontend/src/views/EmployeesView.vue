<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">
        Employees
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openDialog()"
        >
          Add Employee
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="employees"
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
              @click="toggleEmployeeStatus(item)"
            >
              <v-icon>{{ item.isActive ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Employee Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editMode ? 'Edit Employee' : 'Add Employee' }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" @submit.prevent="handleSubmit">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.firstName"
                  label="First Name"
                  required
                  :rules="[v => !!v || 'First name is required']"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.lastName"
                  label="Last Name"
                  required
                  :rules="[v => !!v || 'Last name is required']"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.username"
                  label="Username"
                  required
                  :rules="[v => !!v || 'Username is required']"
                  :disabled="editMode"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.password"
                  label="Password"
                  type="password"
                  :rules="passwordRules"
                  :required="!editMode"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.role"
                  :items="roles"
                  label="Role"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.hourlyRate"
                  label="Hourly Rate"
                  type="number"
                  prefix="$"
                  step="0.01"
                  min="0"
                ></v-text-field>
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
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const API_URL = 'http://localhost:3000/api';
const toast = useToast();

const headers = [
  { title: 'First Name', key: 'firstName' },
  { title: 'Last Name', key: 'lastName' },
  { title: 'Username', key: 'username' },
  { title: 'Role', key: 'role' },
  { title: 'Hourly Rate', key: 'hourlyRate' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
];

const roles = [
  { title: 'Employee', value: 'employee' },
  { title: 'Admin', value: 'admin' }
];

const passwordRules = [
  v => !v || v.length >= 6 || 'Password must be at least 6 characters'
];

const employees = ref([]);
const loading = ref(false);
const dialog = ref(false);
const editMode = ref(false);
const form = ref(null);

const formData = ref({
  firstName: '',
  lastName: '',
  username: '',
  password: '',
  role: 'employee',
  hourlyRate: '',
  isActive: true
});

const resetForm = () => {
  formData.value = {
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    role: 'employee',
    hourlyRate: '',
    isActive: true
  };
  editMode.value = false;
};

const openDialog = (employee = null) => {
  if (employee) {
    editMode.value = true;
    formData.value = { ...employee };
    formData.value.password = ''; // Clear password field for editing
  } else {
    resetForm();
  }
  dialog.value = true;
};

const fetchEmployees = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_URL}/auth/users`);
    employees.value = response.data.data.users;
  } catch (error) {
    toast.error('Failed to fetch employees');
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
      await axios.put(`${API_URL}/auth/users/${formData.value.id}`, formData.value);
      toast.success('Employee updated successfully');
    } else {
      await axios.post(`${API_URL}/auth/register`, formData.value);
      toast.success('Employee created successfully');
    }
    dialog.value = false;
    fetchEmployees();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Operation failed');
  } finally {
    loading.value = false;
  }
};

const toggleEmployeeStatus = async (employee) => {
  try {
    loading.value = true;
    await axios.put(`${API_URL}/auth/users/${employee.id}`, {
      isActive: !employee.isActive
    });
    toast.success(`Employee ${employee.isActive ? 'deactivated' : 'activated'} successfully`);
    fetchEmployees();
  } catch (error) {
    toast.error('Failed to update employee status');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchEmployees();
});
</script>
