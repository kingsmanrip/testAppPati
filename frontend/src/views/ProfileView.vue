<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h5">Profile Settings</v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="handleSubmit" ref="form">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.firstName"
                    label="First Name"
                    :rules="[v => !!v || 'First name is required']"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.lastName"
                    label="Last Name"
                    :rules="[v => !!v || 'Last name is required']"
                    required
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-divider class="my-4"></v-divider>
                  <div class="text-h6 mb-4">Change Password</div>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.currentPassword"
                    label="Current Password"
                    type="password"
                    :rules="passwordRules"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.newPassword"
                    label="New Password"
                    type="password"
                    :rules="passwordRules"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="handleSubmit"
              :loading="loading"
            >
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card class="mt-4">
          <v-card-title class="text-h5">Account Information</v-card-title>
          
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-account</v-icon>
                </template>
                <v-list-item-title>Username</v-list-item-title>
                <v-list-item-subtitle>{{ user?.username }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-shield-account</v-icon>
                </template>
                <v-list-item-title>Role</v-list-item-title>
                <v-list-item-subtitle class="text-capitalize">{{ user?.role }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title>Member Since</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(user?.createdAt) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import { format } from 'date-fns';

const authStore = useAuthStore();
const toast = useToast();

const user = computed(() => authStore.user);
const loading = ref(false);
const form = ref(null);

const formData = ref({
  firstName: user.value?.firstName || '',
  lastName: user.value?.lastName || '',
  currentPassword: '',
  newPassword: ''
});

const passwordRules = [
  v => !v || v.length >= 6 || 'Password must be at least 6 characters'
];

const formatDate = (date) => {
  return date ? format(new Date(date), 'MMMM d, yyyy') : '-';
};

const handleSubmit = async () => {
  if (!form.value) return;
  
  const { valid } = await form.value.validate();
  if (!valid) return;

  try {
    loading.value = true;
    
    const updateData = {
      firstName: formData.value.firstName,
      lastName: formData.value.lastName
    };

    // Only include password update if both fields are filled
    if (formData.value.currentPassword && formData.value.newPassword) {
      updateData.currentPassword = formData.value.currentPassword;
      updateData.newPassword = formData.value.newPassword;
    }

    await authStore.updateProfile(updateData);
    
    // Clear password fields
    formData.value.currentPassword = '';
    formData.value.newPassword = '';
    
    toast.success('Profile updated successfully');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update profile');
  } finally {
    loading.value = false;
  }
};
</script>
