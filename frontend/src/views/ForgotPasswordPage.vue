<template>
  <div class="login-register-background">
    <!-- Toast -->
    <Toast />

    <!-- Back Button at the top-left corner -->
    <button @click="goBack"
      class="absolute top-10 left-10 text-white transform transition-transform hover:scale-110 active:scale-100 cursor-pointer">
      <i class="pi pi-arrow-left" style="font-size: 1.5rem"></i>
    </button>

    <form @submit.prevent="resetPassword" class="bg-white p-5 rounded-xl shadow-lg max-w-md w-full mb-20 mt-10">
      <img src="@/assets/logo.png" alt="Logo" @click="goToHome"
        class="mx-auto mb-4 mt-1 h-200 w-200 transform transition-transform hover:scale-104 active:scale-100" />

      <h1 class="text-center font-bold mb-2 text-4xl" style="color: #525252;">Reset Your Password</h1>
      <p class="text-center mb-4 text-sm" style="color: #525252;">Enter your email and new password</p>

      <!-- Email Input (Phase 1) -->
      <div class="relative mb-4 mt-7">
        <label for="email" class="absolute -top-6 px-0.5 font-semibold text-sm" style="color: #828282;">Email</label>
        <InputText v-model="email" id="email" type="email" placeholder="Enter your email" class="w-full" />
      </div>

      <!-- Password Fields (Phase 2, only show after OTP validation) -->
      <div v-if="showPasswordFields">
        <!-- New Password Input -->
        <div class="relative mb-4 mt-6">
          <label for="newPassword" class="absolute -top-6 px-0.5 font-semibold text-sm" style="color: #828282;">New
            Password</label>

          <!-- Password Component with Validation List -->
          <Password v-model="newPassword" id="newPassword" type="password" toggleMask placeholder="Enter new password"
            promptLabel="Choose a password" class="w-full">
            <template #footer>
              <!-- Password Requirements List -->
              <ul class="pl-4 my-1 leading-normal list-disc text-sm">
                <li>At least one lowercase</li>
                <li>At least one uppercase</li>
                <li>At least one numeric</li>
                <li>Minimum 8 characters</li>
              </ul>
            </template>
          </Password>
        </div>

        <!-- Confirm Password Input -->
        <div class="relative mb-4 mt-6">
          <label for="confirmPassword" class="absolute -top-6 px-0.5 font-semibold text-sm"
            style="color: #828282;">Confirm
            Password</label>
          <Password v-model="confirmPassword" id="confirmPassword" type="password" toggleMask :feedback="false"
            placeholder="Confirm new password" class="w-full" />
        </div>
      </div>

      <!-- Reset Password Button -->
      <div class="mt-6">
        <Button label="Reset Password" :loading="loading" type="submit" :disabled="!isFormValid"
          class="w-full text-white font-extrabold text-lg p-button-rounded hover:shadow-md transform transition-transform hover:scale-102 active:scale-100"
          style="background-color: #1D1128;" />
      </div>

      <!-- Sign In Link -->
      <div class="mt-28 text-center">
        <p class="text-sm" style="color:#828282">
          Remembered password?
          <Button as="router-link" label="Sign In" link to="/login" class="font-semibold text-sm pl-1"
            style="color: #1D1128;" />
        </p>
      </div>
    </form>

    <!-- OTP Dialog -->
    <Dialog v-model:visible="otpRequired" modal class="rounded-xl shadow-lg font-nunito text-primaryText"
      :closable="true" @keyup.enter="submitOtp">
      <h3 class="text-center text-2xl font-bold mb-4">Confirm Your Email Address</h3>
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
        <Button label="Resend Code" link @click="handlePasswordReset"
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
import { ref, computed, defineComponent } from 'vue';
import InputText from 'primevue/inputtext';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputOtp from 'primevue/inputotp';
import Password from 'primevue/password';
import apiClient from '@/services/api';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

export default defineComponent({
  name: 'ForgotPasswordPage',
  components: {
    InputText,
    Button,
    Dialog,
    InputOtp,
    Password,
    Toast
  },
  setup() {
    const email = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    // const errorMessage = ref('');
    const router = useRouter();
    const otp = ref('');
    const otpRequired = ref(false);
    const showPasswordFields = ref(false);
    const loading = ref(false); // Loading icon

    const toast = useToast(); // Popup Messages

    // Computed property to check if credentials are filled
    const isFormValid = computed(() => {
      if (showPasswordFields.value) {
        return email.value.trim() !== '' && newPassword.value.trim() !== '' && confirmPassword.value.trim() !== '';
      } else {
        return email.value.trim() !== ''
      }

    });

    const isOTPValid = computed(() => {
      return otp.value.length == 6
    });

    const handlePasswordReset = async () => {
      if (!email.value) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Email is required', life: 3000 });
        return;
      }
      loading.value = true;

      try {
        // Step 1: Send OTP via email
        await apiClient.forgotPassword({ email: email.value });

        otpRequired.value = true;
        toast.add({ severity: 'info', summary: 'OTP Sent', detail: 'OTP code sent to ' + email.value + '.', life: 3000 });
      } catch (error) {
        console.error("Error requesting password reset:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: (error.response?.data?.detail || 'Failed. Please try again.'), life: 3000 });
      } finally {
        loading.value = false;
      }
    };

    const submitOtp = async () => {
      if (isOTPValid.value && otpRequired.value) {
        try {
          // Step 2: Validate OTP
          const response = await apiClient.verifyOtp({ email: email.value, otp: otp.value });

          if (response.data.message.includes('OTP is valid')) {
            otpRequired.value = false;
            showPasswordFields.value = true;
            toast.add({ severity: 'success', summary: 'Success', detail: 'Choose your new password.', life: 3000 });
          } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Invalid OTP. Please try again.', life: 3000 });
          }
        } catch (error) {
          console.error('OTP verification failed:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Invalid OTP. Please try again.', life: 3000 });
        }

      } else {
        toast.add({ severity: 'warn', summary: 'Invalid', detail: 'Please enter OTP.', life: 3000 });
      }
    }

    const resetPassword = async () => {
      if (showPasswordFields.value) {
        if (isFormValid.value) {

          if (newPassword.value !== confirmPassword.value) {
            toast.add({ severity: 'warn', summary: 'Invalid', detail: 'Passwords do not match!', life: 3000 });
            return;
          }
          // Password validation
          const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
          if (!passwordPattern.test(newPassword.value)) {
            toast.add({ severity: 'warn', summary: 'Invalid', detail: 'Please choose a stronger password.', life: 3000 });
            return;
          }
          loading.value = true;

          try {
            await apiClient.resetPassword({
              email: email.value,
              new_password: newPassword.value
            });

            // Pass the success message as a query parameter to the login page
            router.push({
              path: '/login',
              query: {
                message: 'Password changed successfully!'
              }
            });

          } catch (error) {
            console.error("Password reset failed:", error);
            toast.add({ severity: 'error', summary: 'Error', detail: (error.response?.data?.detail || 'Failed. Please try again.'), life: 3000 });
          } finally {
            loading.value = false;
          }

        } else {
          toast.add({ severity: 'warn', summary: 'Invalid', detail: 'Please fill in all fields', life: 3000 });
        }

      } else {
        handlePasswordReset();
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

    return { email, newPassword, confirmPassword, otp, otpRequired, showPasswordFields, isOTPValid, isFormValid, loading, handlePasswordReset, submitOtp, resetPassword, goToHome, goBack };
  }
});
</script>

<style scoped></style>