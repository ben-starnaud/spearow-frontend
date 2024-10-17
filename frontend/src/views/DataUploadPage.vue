<template>
  <div class="regular-background">
    <div class="data-upload p-10 rounded-xl shadow-xl">
      <div class="mb-4">
        <h3 class="text-lg font-semibold mb-2">Contribute breach data:</h3>
        <p class="mb-2">Include relevant data classes in your breach information. These classes help categorize the types of data exposed in the breach.</p>
        <DataClassesComponent />
      </div>
      
      <form @submit.prevent="uploadData" enctype="multipart/form-data" class="mt-6">
        <div class="form-group">
          <input type="file" @change="handleFileSelect" accept=".json" />
          <small>Accepted format: JSON</small>
        </div>
        <button type="submit" :disabled="!selectedFile || isUploading">
          {{ isUploading ? 'Uploading...' : 'Upload Data' }}
        </button>
      </form>
      <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-4">
        <ProgressBar :value="uploadProgress" />
      </div>
      <div v-if="uploadMessage" class="mt-4 response-message" :class="{ 'text-green-500': uploadSuccess, 'text-red-500': !uploadSuccess }">
        {{ uploadMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import ProgressBar from 'primevue/progressbar';
import apiClient from '@/services/api';
import DataClassesComponent from './DataClassesComponent.vue';

export default {
  name: 'DataUploadPage',
  components: { ProgressBar, DataClassesComponent },
  setup() {
    const selectedFile = ref(null);
    const isUploading = ref(false);
    const uploadProgress = ref(0);
    const uploadMessage = ref('');
    const uploadSuccess = ref(false);

    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        selectedFile.value = file;
      } else {
        uploadMessage.value = "Please select a JSON file.";
        uploadSuccess.value = false;
        selectedFile.value = null;
      }
    };

    const uploadData = async () => {
      if (!selectedFile.value) return;

      const formData = new FormData();
      formData.append('file', selectedFile.value);
      
      isUploading.value = true;
      uploadProgress.value = 0;
      uploadMessage.value = '';

      try {
        const response = await apiClient.uploadData(formData, {
          onUploadProgress: (progressEvent) => {
            uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          }
        });
        uploadMessage.value = response.data.message;
        uploadSuccess.value = true;
      } catch (error) {
        uploadMessage.value = error.response?.data?.detail || 'Upload failed. Please try again.';
        uploadSuccess.value = false;
      } finally {
        isUploading.value = false;
      }
    };

    return {
      selectedFile,
      isUploading,
      uploadProgress,
      uploadMessage,
      uploadSuccess,
      handleFileSelect,
      uploadData
    };
  }
};
</script>

<style scoped>
.data-upload {
  background: #f5f5f5;
}
h2 {
  text-align: center;
  margin-bottom: 20px;
}
.response-message {
  text-align: center;
  margin: 0 auto;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
input, select, textarea {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}
button {
  display: block;
  width: 100%;
  padding: 10px;
  background-color:#2b193b !important;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #2b193b !important;
}
</style>