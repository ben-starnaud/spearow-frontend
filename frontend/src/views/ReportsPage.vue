<template>
  <div class="regular-background">
    <!-- Toast -->
    <Toast class="z-50" />

    <div class="report-generator p-10 rounded-xl shadow-xl w-full max-w-lg">
      <div v-if="!isGenerating">
        <h2 class="text-xl font-bold">Generate Your Custom Report</h2>
        <form @submit.prevent="generateReport">

          <!-- Report Type -->
          <div class="form-group">
            <label for="reportType">Report Type:</label>
            <select v-model="reportType" id="reportType" required>
              <option value="detailed">Detailed Breach Report</option>
              <option value="user">My Breach Report</option>
            </select>
          </div>

          <!-- Report Categories (only shown for Detailed Report) -->
          <div v-if="reportType === 'detailed'" class="form-group">
            <label for="reportCategory">Report Categories:</label>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span>All Breaches</span>
                <RadioButton v-model="reportCategory" inputId="allbreaches" value="allbreaches" class="ml-2" />
              </div>
              <div class="flex items-center justify-between">
                <span>Latest Breaches</span>
                <RadioButton v-model="reportCategory" inputId="latestBreaches" value="latestBreaches" class="ml-2" />
              </div>
              <div class="flex items-center justify-between">
                <span>Single Breached Site</span>
                <RadioButton v-model="reportCategory" inputId="singleBreachedSite" value="singleBreachedSite"
                  class="ml-2" />
              </div>
            </div>

            <!-- Only show the breach site input if 'Single Breached Site' is selected -->
            <div v-if="reportCategory === 'singleBreachedSite'" class="form-group mt-4">
              <label for="singleBreachSite">Breach Site:</label>
              <input type="text" id="singleBreachSite" v-model="singleBreachSite" required
                @input="validateSingleBreachSite" class="border border-gray-300 p-2 rounded w-full" />
              <span v-if="singleBreachSiteError" class="text-red-500">
                {{ singleBreachSiteError }}
              </span>
            </div>
          </div>

          <!-- Report Format -->
          <div class="form-group">
            <label for="reportFormat">Report Format:</label>
            <select v-model="reportFormat" id="reportFormat" required>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <!-- Additional Notes -->
          <div class="form-group">
            <!-- <label for="notes">Additional Notes:</label>
          <textarea v-model="notes" id="notes" placeholder="Optional: Any specific requirements or comments"></textarea> -->
          </div>

          <button type="submit"
            class="hover:shadow-md transform transition-transform hover:scale-102 active:scale-100">Generate
            Report</button>
        </form>
      </div>
      <div v-if="isGenerating" class="response-message">
        <pre> {{ message }} </pre>
      </div>
    </div>
  </div>
</template>

<script>
import {defineComponent, ref} from 'vue';
import apiClient from '@/services/api';
import RadioButton from 'primevue/radiobutton';
import { state } from '@/state';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

export default defineComponent({
  name: 'ReportsPage',
  components: {
    RadioButton,
    Toast,
  },
  setup() {
    const reportType = ref('');
    const reportCategory = ref('');
    const singleBreachSite = ref('');
    const singleBreachSiteError = ref('');
    const reportFormat = ref('');
    const notes = ref('');
    const isGenerating = ref(false);
    const message = ref('');

    const toast = useToast(); // Popup Messages

    const validateSingleBreachSite = () => {
      if (reportCategory.value === 'singleBreachedSite' && !singleBreachSite.value.trim()) {
        singleBreachSiteError.value = 'Breach site cannot be empty';
      } else {
        singleBreachSiteError.value = '';
      }
    };

    const generateReport = async () => {
      if (reportCategory.value === 'singleBreachedSite' && !singleBreachSite.value.trim()) {
        singleBreachSiteError.value = 'Breach site cannot be empty';
        return;
      }

      // if (!state.submittedID) {
      //   toast.add({ severity: 'warn', summary: 'Please Upload a Valid ID', detail: 'Go to "My Account" and upload your ID first.', life: 3000 });
      //   return;
      // }

      if (!state.isVerified) {
        toast.add({ severity: 'warn', summary: 'Not Verified Yet', detail: 'Go to "My Account" and upload your ID first.', life: 3000 });
        return;
      }

      try {
        const reportData = {
          reportType: reportType.value,
          reportCategory: reportCategory.value === 'singleBreachedSite' 
            ? singleBreachSite.value
            : reportCategory.value,
          reportFormat: reportFormat.value,
          notes: notes.value,
          token: localStorage.getItem("token")
        };

        if (reportFormat.value === 'csv') {
          const response = await apiClient.fetchReports(reportData);

          // Create a download link
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'report.csv');
          
          // Append the link to the document and trigger a click to start the download
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          document.body.removeChild(link);
          link.remove()
          window.URL.revokeObjectURL(url);
          message.value = "Report Generated Successfully";
        } else if (reportFormat.value === 'json') {
          const response = await apiClient.fetchReports(reportData);
          message.value = response.data;
        } else if (reportFormat.value === 'pdf') {
          const response = await apiClient.fetchReports(reportData);

          // Create a download link
          const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'report.pdf'); 

          // Append the link to the document and trigger a click to start the download
          document.body.appendChild(link);
          link.click();

          // Clean up
          document.body.removeChild(link);
          link.remove();
          window.URL.revokeObjectURL(url);
          message.value = "Report Generated Successfully";
        }
      } catch (error) {
        if (error.response) {
          message.value = `Error: ${error.response.data.detail || error.response.data.message || 'Unknown error'}`;
        } else if (error.request) {
          message.value = 'No response received from server. Please try again.';
        } else {
          message.value = 'An error occurred while sending the request. Please try again.';
        }
      } finally {
        isGenerating.value = true;
      }
    };

    return {
      reportType,
      reportCategory,
      singleBreachSite,
      singleBreachSiteError,
      reportFormat,
      notes,
      isGenerating,
      message,
      validateSingleBreachSite,
      generateReport,
    };
  }
});
</script>

<style scoped>
.report-generator {
  background: #f5f5f5;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

pre {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
  word-wrap: break-word;
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
  background-color: #2b193b !important;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #2b193b !important;
}
</style>
