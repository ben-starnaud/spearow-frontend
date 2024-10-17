<template>
  <div>
    <!-- Conditionally render Menubar -->
    <div v-if="!isAuthPage">
      <!-- Toast -->
      <Toast class="z-50" />

      <!-- Upload ID -->
      <Dialog v-model:visible="showUploadDialog" class="rounded-xl shadow-lg font-nunito text-primaryText"
        header="Upload Your ID" modal>
        <div class="text-center mb-4">
          <p>Please upload a clear photo of your government-issued ID to complete the verification process.</p>
        </div>
        <FileUpload name="idUpload" :customUpload="true" @select="onFileSelect" :multiple="false" accept="image/*"
          :maxFileSize="1000000">
          <template #header="{ chooseCallback, clearCallback, files }">
            <div class="flex justify-between items-center">
              <div class="flex gap-2 w-full">
                <Button @click="chooseCallback()" icon="pi pi-plus"
                  class="w-1/3 text-white bg-primaryText p-button-rounded hover:shadow-sm transform transition-transform hover:scale-102 active:scale-100"
                  outlined>
                  <i class="pi pi-plus mr-2"></i>Choose
                </Button>

                <Button @click="customUpload" icon="pi pi-upload"
                  class="w-1/3 text-primaryText border-2 p-button-rounded hover:shadow-sm transform transition-transform hover:scale-102 active:scale-100"
                  outlined :disabled="!files || files.length === 0">
                  <i class="pi pi-upload mr-2"></i>Upload
                </Button>

                <Button @click="clearCallback()" icon="pi pi-times"
                  class="w-1/3 text-primaryText border-2 p-button-rounded hover:shadow-sm transform transition-transform hover:scale-102 active:scale-100"
                  outlined severity="danger" :disabled="!files || files.length === 0">
                  <i class="pi pi-times mr-2"></i>Cancel
                </Button>
              </div>
            </div>
          </template>

          <template #empty>
            <div class="text-center">
              <i class="pi pi-cloud-upload text-4xl mb-3"></i>
              <p>Drag and drop your ID image here or click to upload.</p>
            </div>
          </template>
        </FileUpload>
      </Dialog>

      <!-- Transparent Menubar -->
      <Menubar :model="items" class="absolute w-full bg-transparent top-0 left-0 z-50">
        <template #start>
          <div class="flex items-center">
            <img src="@/assets/logo.png" alt="Spearow Logo" @click="goToHome"
              class="h-24 w-24 mr-2 transform transition-transform hover:scale-104 active:scale-100 cursor-pointer">
            <span
              class="text-5xl font-extrabold text-primaryText font-nunito mr-6 transform transition-transform hover:scale-103 active:scale-100">Spearow</span>
          </div>

          <!-- Menu items for navigation with active state underline -->
          <div class="hidden lg:flex space-x-12 text-base font-semibold font-nunito text-primaryText pt-1">
            <!-- Home Link -->
            <span @click="goToHome" class="cursor-pointer transform transition-none hover:scale-103 active:scale-100"
              :class="{ 'active-tab shadow-lg': isActive('/home') }">
              Home
            </span>

            <!-- Reports Link with Auth Check -->
            <span @click="navigateTo('/reports')"
              class="cursor-pointer transform transition-none hover:scale-103 active:scale-100"
              :class="{ 'active-tab shadow-lg': isActive('/reports') }">
              Reports
            </span>

            <!-- Data Upload Link with Auth Check -->
            <span @click="navigateTo('/data-upload')"
              class="cursor-pointer transform transition-none hover:scale-103 active:scale-100"
              :class="{ 'active-tab shadow-lg': isActive('/data-upload') }">
              Upload Data
            </span>

            <span v-if="state.isAdmin" @click="navigateTo('/admin')"
              class="cursor-pointer transform transition-none hover:scale-103 active:scale-100"
              :class="{ 'active-tab shadow-lg': isActive('/admin') }">
              Admin
            </span>

          </div>
        </template>

        <template #end>

          <div v-if="state.isAuthenticated" class="hidden lg:flex space-x-4 items-center">
            <!-- Avatar when authenticated -->
            <span
              class="text-lg font-semibold text-primaryText font-nunito transform transition-transform hover:scale-105 active:scale-100 cursor-pointer"
              @click="visible = true">My Account</span>
            <Avatar icon="pi pi-user text-primaryText"
              class="mr-2 shadow-lg bg-white transform transition-transform hover:scale-110 active:scale-100 cursor-pointer"
              size="large" shape="circle" @click="visible = true" />

            <!-- Drawer Component -->
            <Drawer v-model:visible="visible" position="right" class="font-nunito">
              <template #header>
                <div class="flex items-center gap-2">
                  <Avatar icon="pi pi-user text-primaryText" shape="circle" size="large" />
                  <span class="font-bold">{{ userInfo ? userInfo.name : 'User' }}</span>
                  <i v-if="state.isVerified" class="pi pi-verified text-primaryText" style="font-size: 1.2rem;"></i>
                </div>
              </template>

              <div v-if="state.isVerified">
                <p>{{ state.isAdmin ? "Admin" : "Verified" }} user.</p>
              </div>

              <div v-else>
                <Card style="background-color: #f9f9f9;">
                  <template #title>
                    <div class="flex items-center gap-2">
                      <i class="pi pi-verified text-primaryText" style="font-size: 1.5rem;"></i>
                      <span class="text-xl font-bold text-primaryText">Get Verified</span>
                    </div>
                  </template>

                  <template #content>
                    <div v-if="state.submittedID" class="flex mt-2">
                      <p class="m-0 text-md text-primaryText">
                        We need to verify your identity. We'll review your ID and let you know once you're verified!
                      </p>
                    </div>
                    <div v-else>
                      <p class="m-0 text-md text-primaryText">
                        We need to verify your identity. Upload a photo of your ID to get started.
                      </p>
                    </div>
                  </template>

                  <template #footer>
                    <div class="flex gap-4 mt-3">
                      <Button label="Upload ID" :disabled="state.submittedID" icon="pi pi-upload"
                        @click="showUploadDialog = true"
                        class="flex-auto text-white !bg-blue-900 border-2 p-button-rounded hover:shadow-sm transform transition-transform hover:scale-102 active:scale-100" />
                    </div>
                  </template>
                </Card>
              </div>

              <template #footer>
                <div class="flex items-center gap-2">
                  <Button label="Account" icon="pi pi-user" @click="viewAccount"
                    class="flex-auto text-primaryText border-2 p-button-rounded hover:shadow-sm transform transition-transform hover:scale-102 active:scale-100"
                    outlined></Button>
                  <Button label="Logout" icon="pi pi-sign-out" @click="logOut"
                    class="flex-auto text-primaryText border-2 p-button-rounded hover:shadow-sm transform transition-transform hover:scale-102 active:scale-100"
                    text></Button>
                </div>
              </template>
            </Drawer>
          </div>

          <div v-else class="hidden lg:flex space-x-4">
            <button
              class="border-2 border-primaryText text-primaryText text-base font-nunito font-semibold py-2.5 px-4 rounded-full hover:shadow-md transform transition-transform hover:scale-104 active:scale-100"
              @click="goToLogin">
              Log In
            </button>
            <button
              class="bg-primaryText border-primaryText border-2 text-white text-base font-nunito font-semibold py-2.5 px-4 mr-3 rounded-full hover:shadow-md transform transition-transform hover:scale-104 active:scale-100"
              @click="goToRegister">
              Create Account
            </button>
          </div>

          <!-- Hamburger Menu for small screens -->
          <button class="lg:hidden flex text-base text-primaryText mr-5 mt-1" @click="toggleMenu">
            <i class="pi pi-bars" style="font-size: 1.8rem"></i>
          </button>
        </template>
      </Menubar>

      <!-- Dropdown Menu for small screens -->
      <div v-if="menuVisible"
        class="absolute top-20 right-2 border-1 bg-white text-primaryText rounded-lg shadow-2xl py-4 px-6 z-50 lg:hidden"
        style="border-color: gray;">
        <!-- Menu items for navigation in the dropdown -->
        <router-link to="/home"
          class="block py-2 text-lg font-semibold font-nunito transition-all text-primaryText transform transition-none hover:scale-103 active:scale-100"
          @click="toggleMenu" active-class="font-bold">Home</router-link>
        <router-link to="/reports"
          class="block py-2 text-lg font-semibold font-nunito transition-all text-primaryText transform transition-none hover:scale-103 active:scale-100"
          @click="toggleMenu" active-class="font-bold">Reports</router-link>
        <router-link to="/data-upload"
          class="block py-2 text-lg font-semibold font-nunito transition-all text-primaryText transform transition-none hover:scale-103 active:scale-100"
          @click="toggleMenu" active-class="font-bold">Upload Data</router-link>

        <hr class="my-3 border-gray-200">

        <div v-if="!state.isAuthenticated">
          <!-- Login and Create Account buttons for small screens -->
          <button
            class="block w-full border-2 border-primaryText text-primaryText text-base font-nunito font-semibold py-2.5 px-4 rounded-full hover:shadow-md transform transition-transform hover:scale-104 active:scale-100 mt-2">
            Log In
          </button>
          <button
            class="block w-full bg-primaryText border-primaryText border-2 text-white text-base font-nunito font-semibold py-2.5 px-4 rounded-full hover:shadow-md transform transition-transform hover:scale-104 active:scale-100 mt-2">
            Create Account
          </button>
        </div>

        <div v-else class="flex items-center space-x-3">
          <!-- Avatar when authenticated on small screen -->
          <span
            class="text-md font-semibold text-primaryText font-nunito transform transition-transform hover:scale-105 active:scale-100 cursor-pointer"
            @click="visible = true">My Account</span>
          <Avatar icon="pi pi-user text-primaryText" @click="visible = true"
            class="mr-2 transform transition-transform hover:scale-105 active:scale-100" size="large" shape="circle" />

          <!-- Drawer Component -->
          <Drawer v-model:visible="visible" position="right" class="font-nunito">
            <template #header>
              <div class="flex items-center gap-2">
                <Avatar icon="pi pi-user text-primaryText" shape="circle" size="large" />
                <span class="font-bold">{{ userInfo ? userInfo.name : 'User' }}</span>
              </div>
            </template>

            <div v-if="state.isVerified">
              <p>{{ state.isAdmin ? "Admin" : "Verified" }} user.</p>
            </div>

            <div v-else>
              <Card style="background-color: #f9f9f9;">
                <template #title>
                  <div class="flex items-center gap-2">
                    <i class="pi pi-verified text-primaryText" style="font-size: 1.5rem;"></i>
                    <span class="text-xl font-bold text-primaryText">Get Verified</span>
                  </div>
                </template>

                <template #content>
                  <div v-if="state.submittedID" class="flex mt-2">
                    <p class="m-0 text-md text-primaryText">
                      We need to verify your identity. We'll review your ID and let you know once you're verified!
                    </p>
                  </div>
                  <div v-else>
                    <p class="m-0 text-md text-primaryText">
                      We need to verify your identity. Upload a photo of your ID to get started.
                    </p>
                  </div>
                </template>

                <template #footer>
                  <div class="flex gap-4 mt-3">
                    <Button label="Upload ID" :disabled="state.submittedID" icon="pi pi-upload"
                      @click="showUploadDialog = true"
                      class="flex-auto text-white !bg-blue-900 border-2 p-button-rounded hover:shadow-sm transform transition-transform hover:scale-102 active:scale-100" />
                  </div>
                </template>
              </Card>
            </div>

            <template #footer>
              <div class="flex items-center gap-2">
                <Button label="Account" icon="pi pi-user" @click="viewAccount"
                  class="flex-auto text-primaryText border-2 p-button-rounded hover:shadow-sm transform transition-transform hover:scale-102 active:scale-100"
                  outlined></Button>
                <Button label="Logout" icon="pi pi-sign-out" @click="logOut"
                  class="flex-auto text-primaryText border-2 p-button-rounded hover:shadow-sm transform transition-transform hover:scale-102 active:scale-100"
                  severity="danger" text></Button>
              </div>
            </template>
          </Drawer>
        </div>

      </div>
    </div>

    <!-- The rest of the content (router-view) -->
    <router-view />
  </div>
</template>

<script>
import { defineComponent, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';
import Avatar from 'primevue/avatar';
import Drawer from 'primevue/drawer';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import { state } from './state';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import apiClient from '@/services/api';

export default defineComponent({
  name: 'App',
  components: {
    Menubar,
    Avatar,
    Drawer,
    Button,
    Toast,
    Card,
    Dialog,
    FileUpload
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const visible = ref(false);
    const userInfo = ref(null);
    const showUploadDialog = ref(false);

    // Handle file upload
    const customUpload = async () => {
      if (selectedFile.value) {

        if (userInfo.value && userInfo.value.id_file) {
          toast.add({ severity: 'warn', summary: 'Already Uploaded ID', detail: 'You have already uploaded your ID.', life: 3000 });
        } else {

          const formData = new FormData();
          formData.append('file', selectedFile.value); // Use the stored file

          try {
            const response = await apiClient.uploadID(formData);

            toast.add({
              severity: 'info',
              summary: 'File Uploaded',
              detail: response.data.message || 'Your ID has been successfully uploaded!',
              life: 3000,
            });
            toast.add({
              severity: 'info',
              summary: 'Verification',
              detail: 'We\'ll review your ID and let you know once you\'re verified!',
              life: 5000,
            });
            showUploadDialog.value = false; // Close the dialog after successful upload
            userInfo.value.id_file = true;
            state.submittedID = true;
          } catch (error) {
            console.error("Error uploading file:", error);
            toast.add({
              severity: 'error',
              summary: 'Upload Failed',
              detail: 'There was an error uploading your ID.',
              life: 3000,
            });
          }

        }
      }
    };

    const selectedFile = ref(null);

    const onFileSelect = (event) => {
      selectedFile.value = event.files[0]; // Store the file in a variable
    };

    const toast = useToast(); // Popup Messages

    // Function to fetch user info
    const fetchUserInfo = async () => {
      if (state.isAuthenticated) {
        try {
          const response = await apiClient.getUserInfo(); // Make API call to fetch user info
          userInfo.value = response.data; // Store user info

          if (userInfo.value && userInfo.value.user_type === 'admin') {
            state.isAdmin = true;
          } else {
            state.isAdmin = false;
          }

          state.isVerified = userInfo.value.verified ? true : false;
          state.submittedID = userInfo.value.id_file ? true : false;
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch user information.', life: 3000 });
        }
      }
    };

    const isActive = (path) => {
      return router.currentRoute.value.path === path;
    };

    const navigateTo = (path) => {
      if (!state.isAuthenticated) {
        // Show Toast warning if user is not authenticated
        toast.add({ severity: 'warn', summary: 'Not Authorized', detail: 'Please Log In or Create an Account first.', life: 3000 });
      } else {
        // If authenticated, navigate to the selected page
        setTimeout(() => {
          router.push(path);
        }, 50); // Adding a small delay for smoother transition
      }
    };

    const goToRegister = () => {
      setTimeout(() => {
        router.push('/register');
      }, 50); // milliseconds delay
    };

    const goToLogin = () => {
      setTimeout(() => {
        router.push('/login');
      }, 50); // milliseconds delay
    };

    const goToHome = () => {
      setTimeout(() => {
        router.push('/home');
      }, 50); // milliseconds delay
    };

    // List of authentication-related routes
    const authPages = ['/login', '/register', '/forgot-password'];

    const isAuthPage = ref(authPages.includes(route.path));

    // Watch for route changes and update isAuthPage accordingly
    watch(route, (newRoute) => {
      isAuthPage.value = authPages.includes(newRoute.path);

      if (!userInfo.value) {
        fetchUserInfo();
      }
    });

    const menuVisible = ref(false);

    // Toggle the menu visibility on mobile
    const toggleMenu = () => {
      menuVisible.value = !menuVisible.value;
    };

    const logOut = () => {
      state.isAuthenticated = false;
      sessionStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      router.push('/home');

      toast.add({ severity: 'info', summary: 'Logged Out', detail: 'Successfully logged out of your Account.', life: 3000 });

      // Delay the page reload to allow the toast message to be visible
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Wait to ensure the Toast message shows before reloading
    };

    const viewAccount = () => {
      toast.add({ severity: 'info', summary: 'Coming Soon', detail: 'This feature is coming soon.', life: 3000 });
    }

    const items = []; // Empty for now

    return { items, isAuthPage, menuVisible, toggleMenu, goToLogin, goToRegister, goToHome, state, visible, logOut, navigateTo, isActive, userInfo, viewAccount, showUploadDialog, customUpload, onFileSelect };
  }
});
</script>

<style scoped>
.active-tab {
  border-bottom: 3px solid #1D1128;
  transition: all 0.3s ease-out;
}
</style>