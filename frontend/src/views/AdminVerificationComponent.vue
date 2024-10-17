<template>
  <div class="admin-verification">
    <h2>Unverified Uploads</h2>
    <div v-if="loading">Loading unverified uploads...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <table v-if="unverifiedUploads.length > 0" class="upload-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Upload Date</th>
            <th>File Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="upload in unverifiedUploads" :key="upload.id">
            <td>{{ upload.file_name }}</td>
            <td>{{ formatDate(upload.upload_date) }}</td>
            <td>{{ upload.file_type }}</td>
            <td>
              <button @click="verifyUpload(upload.id)" class="verify-btn">Verify</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else>No unverified uploads found.</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/api';

export default {
  name: 'AdminVerificationComponent',
  setup() {
    const unverifiedUploads = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchUnverifiedUploads = async () => {
      try {
        const response = await apiClient.getUnverifiedUploads();
        unverifiedUploads.value = response.data;
      } catch (err) {
        console.error('Error fetching unverified uploads:', err);
        error.value = 'Failed to load unverified uploads. Please try again later.';
      } finally {
        loading.value = false;
      }
    };

    const verifyUpload = async (uploadId) => {
      try {
        await apiClient.verifyUpload(uploadId);
        // Remove the verified upload from the list
        unverifiedUploads.value = unverifiedUploads.value.filter(upload => upload.id !== uploadId);
      } catch (err) {
        console.error('Error verifying upload:', err);
        error.value = 'Failed to verify upload. Please try again.';
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString();
    };

    onMounted(fetchUnverifiedUploads);

    return {
      unverifiedUploads,
      loading,
      error,
      verifyUpload,
      formatDate
    };
  }
};
</script>

<style scoped>
.admin-verification {
  margin: 20px;
}

.upload-table {
  width: 100%;
  border-collapse: collapse;
}

.upload-table th, .upload-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.upload-table th {
  background-color: #2b193b;
  color: white;
}

.verify-btn {
  background-color: #2b193b;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.verify-btn:hover {
  background-color: #3c2653;
}

.error {
  color: red;
}
</style>
