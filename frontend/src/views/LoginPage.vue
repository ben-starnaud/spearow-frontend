<template>
  <div class="login-register-background">
    <!-- Toast -->
    <Toast />

    <!-- Back Button at the top-left corner -->
    <button @click="goBack"
      class="absolute top-10 left-10 text-white transform transition-transform hover:scale-110 active:scale-100">
      <i class="pi pi-arrow-left" style="font-size: 1.5rem"></i>
    </button>

    <!-- Login form -->
    <form @submit.prevent="login" @keyup.enter=submit
      class="bg-white p-5 rounded-xl shadow-lg max-w-md w-full mb-20 mt-10">
      <img src="@/assets/logo.png" alt="Logo"
        class="mx-auto mb-4 mt-1 h-200 w-200 transform transition-transform hover:scale-104 active:scale-100 cursor-pointer"
        @click="goToHome" />

      <!-- Title -->
      <h1 class="text-center font-bold mb-2 text-4xl" style="color: #525252;">Login to your Account</h1>

      <!-- Subtitle -->
      <p class="text-center mb-4 text-sm" style="color: #525252;">See where your information has been leaked</p>

      <!-- Username Input -->
      <div class="relative mb-4 mt-7">
        <label for="username" class="absolute -top-6 px-0.5 font-semibold text-sm" style="color: #828282;">Email</label>
        <InputText v-model="username" id="username" type="email" placeholder="mail@abc.com" class="w-full" />
      </div>

      <!-- Password Input -->
      <div class="relative mb-4 mt-6">
        <label for="password" class="absolute -top-6 px-0.5 font-semibold text-sm"
          style="color: #828282;">Password</label>
        <Password v-model="password" id="password" type="password" :feedback="false" toggleMask placeholder="*********"
          class="w-full" />

        <!-- Forgot Password button -->
        <Button as="router-link" label="Forgot Password?" link to="/forgot-password"
          class="font-semibold text-xs absolute -right-4 -bottom-8" style="color: #1D1128;" />
      </div>

      <!-- Login Button -->
      <div class="mt-6">
        <Button label="Login" :loading="loading" :disabled="!isFormValid" type="submit"
          class="w-full text-white font-extrabold text-lg p-button-rounded hover:shadow-md transform transition-transform hover:scale-102 active:scale-100"
          style="background-color: #1D1128;" />
      </div>

      <!-- Register Link -->
      <div class="mt-28 text-center">
        <p class="text-sm" style="color:#828282">
          Not registered yet?
          <Button as="router-link" label="Create an Account" link to="/register" class="font-semibold text-sm pl-1"
            style="color: #1D1128;" />
        </p>
      </div>
    </form>

    <!-- OTP Dialog -->
    <Dialog v-model:visible="otpRequired" modal class="rounded-xl shadow-lg font-nunito text-primaryText"
      :closable="true" @keyup.enter="submitOtp">
      <h3 class="text-center text-2xl font-bold mb-4">Authenticate Your Account</h3>
      <p class="text-center text-surface-500 mb-5">Please enter the OTP sent to your email.</p>

      <!-- OTP Input Field -->
      <div class="flex justify-center mb-5">
        <InputOtp v-model="otp" integerOnly :length="6" class="mx-7" style="gap: 0.5rem;">
          <template #default="{ attrs, events }">
            <input type="text" v-bind="attrs" v-on="events" class="custom-otp-input" maxlength="1" autofocus />
          </template>
        </InputOtp>
      </div>

      <!-- Resend Code and Submit OTP Buttons -->
      <div class="flex justify-center mb-2">
        <Button label="Resend Code" link @click="login"
          class="mr-4 transform transition-none hover:scale-102 active:scale-100" />
        <Button label="Submit Code" @click="submitOtp" :disabled="!isOTPValid"
          class="text-white font-extrabold p-button-rounded ml-4 hover:shadow-md transform transition-transform hover:scale-102 active:scale-100"
          style="background-color: #1D1128;" />
      </div>
    </Dialog>

    <!-- Blurred background when OTP dialog is active -->
    <div v-if="otpRequired" class="blur-overlay"></div>

  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { state } from '../state';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputOtp from 'primevue/inputotp';
import Password from 'primevue/password';
import apiClient from '@/services/api';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import { onMounted } from 'vue';

export default defineComponent({
  name: 'LoginPage',
  components: {
    InputText,
    Button,
    Dialog,
    InputOtp,
    Password,
    Toast
  },
  setup() {
    const username = ref('');
    const password = ref('');
    const router = useRouter();
    const loading = ref(false); // Loading icon
    const otp = ref(''); // OTP field
    const otpRequired = ref(false); // Controls OTP input visibility

    const toast = useToast(); // Popup Messages

    // Query message from other pages
    onMounted(() => {
      const queryMessage = router.currentRoute.value.query.message;
      if (queryMessage) {
        // Display the success message via Toast
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: queryMessage,
          life: 3000
        });
      }

      // Replace the URL to remove the query parameter without reloading the page
      router.replace({ query: null });
    });

    // Computed property to check if credentials are filled
    const isFormValid = computed(() => {
      return username.value.trim() !== '' && password.value.trim() !== '';
    });

    const isOTPValid = computed(() => {
      return otp.value.length == 6
    });

    const login = async () => {
      if (isFormValid.value) {
        loading.value = true;

        try {
          // Build login payload
          const payload = {
            email: username.value,
            password: password.value
          };

          // Make API call to backend for login
          const response = await apiClient.login(payload)

          // If OTP is required, display OTP popup
          if (response.data.message.includes("OTP sent")) {
            otpRequired.value = true;
            toast.add({ severity: 'info', summary: 'OTP Sent', detail: 'OTP code sent to ' + username.value + '.', life: 3000 });
          } else {
            // Successful login
            state.isAuthenticated = true; // Update global state
            sessionStorage.setItem('isAuthenticated', 'true'); // Save auth status
            localStorage.setItem('token', response.data.token); // Save JWT token
            // Pass the success message as a query parameter to the login page
            router.push({
              path: '/home',
              query: {
                message: 'Welcome, logged in successfully!'
              }
            });
          }

        } catch (error) {
          console.error('Login failed:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: (error.response?.data?.detail || 'Login failed. Please try again.'), life: 3000 });
        } finally {
          loading.value = false;
        }
      } else {
        toast.add({ severity: 'warn', summary: 'Invalid', detail: 'Please enter email and password.', life: 3000 });
      }
    };

    const submitOtp = async () => {
      if (isOTPValid.value) {
        try {
          // Submit OTP logic
          const payload = {
            email: username.value,
            password: password.value,
            otp: otp.value
          };

          const response = await apiClient.login(payload); // Submit OTP to the backend

          // Handle successful login
          state.isAuthenticated = true;
          sessionStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('token', response.data.token);

          otpRequired.value = false; // Close OTP dialog
          // Pass the success message as a query parameter to the login page
          router.push({
            path: '/home',
            query: {
              message: 'Welcome, logged in successfully!'
            }
          });
        } catch (error) {
          console.error('OTP verification failed:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Invalid OTP. Please try again.', life: 3000 });
        }

      } else {
        toast.add({ severity: 'warn', summary: 'Invalid', detail: 'Please enter OTP.', life: 3000 });
      }
    };

    const goToHome = () => {
      setTimeout(() => {
        router.push('/home');
      }, 50); // milliseconds delay
    };

    const goBack = () => {
      setTimeout(() => {
        router.back();
      }, 50); // milliseconds delay
    };

    return { username, password, login, loading, isFormValid, isOTPValid, otp, otpRequired, submitOtp, goToHome, goBack };
  }
});
</script>

<style scoped>

</style>