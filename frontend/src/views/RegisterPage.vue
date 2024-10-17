<template>
    <div class="login-register-background">
        <!-- Toast -->
        <Toast />

        <!-- Back Button at the top-left corner -->
        <button @click="goBack"
            class="absolute top-10 left-10 text-white transform transition-transform hover:scale-110 active:scale-100">
            <i class="pi pi-arrow-left" style="font-size: 1.5rem"></i>
        </button>

        <!-- Register form -->
        <form @submit.prevent="register" @keyup.enter=submit
            class="bg-white py-5 rounded-xl shadow-lg max-w-2xl w-full mb-20 mt-10">

            <!-- Logo and Title -->
            <div class="flex items-center justify-center mb-4 mr-3">
                <img src="@/assets/logo.png" alt="Logo" @click="goToHome"
                    class="h-150 w-150 transform transition-transform hover:scale-104 active:scale-100 cursor-pointer" />
                <h1 class="text-5xl font-bold" style="color: #525252;">Spearow</h1>
            </div>

            <!-- Title and subtitle -->
            <div class="mb-6 text-left max-w-sm mx-auto">
                <h2 class="text-4xl font-bold mb-1" style="color: #525252;">Create an Account</h2>
                <p class="text-sm px-1" style="color: #525252;">Your details are safe with us</p>
            </div>

            <!-- Name input field -->
            <div class="relative mb-4 max-w-sm mx-auto">
                <label for="name" class="absolute -top-6 px-0.5 font-semibold text-sm"
                    style="color: #828282;">Name</label>
                <InputText v-model="name" id="name" placeholder="Enter your name" class="w-full" />
            </div>

            <!-- Email input field -->
            <div class="relative mb-4 mt-6 max-w-sm mx-auto">
                <label for="email" class="absolute -top-6 px-0.5 font-semibold text-sm"
                    style="color: #828282;">Email</label>
                <InputText v-model="email" id="email" type="email" placeholder="Enter your email address"
                    class="w-full" />
            </div>

            <!-- Password Input Field -->
            <div class="relative mb-4 mt-6 max-w-sm mx-auto">
                <label for="password" class="absolute -top-6 px-0.5 font-semibold text-sm"
                    style="color: #828282;">Password</label>

                <!-- Password Component with Validation List -->
                <Password v-model="password" id="password" type="password" toggleMask placeholder="Enter a password"
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

            <!-- Confirm Password input field -->
            <div class="relative mb-4 mt-6 max-w-sm mx-auto">
                <label for="confirmPassword" class="absolute -top-6 px-0.5 font-semibold text-sm"
                    style="color: #828282;">Confirm Password</label>
                <Password v-model="confirmPassword" id="confirmPassword" type="password" toggleMask :feedback="false"
                    placeholder="Enter password again" class="w-full" />
            </div>

            <!-- Create Account Button -->
            <div class="mt-6 max-w-sm mx-auto">
                <Button label="Create Account" :loading="loading" :disabled="!isFormValid" type="submit"
                    class="w-full text-white font-extrabold text-lg p-button-rounded hover:shadow-md transform transition-transform hover:scale-102 active:scale-100"
                    style="background-color: #1D1128;" />
            </div>

            <!-- Login Link -->
            <div class="mt-28 text-center">
                <p class="text-sm" style="color:#828282">
                    Already have an account?
                    <Button as="router-link" label="Sign In" link to="/login" class="font-semibold text-sm pl-1"
                        style="color: #1D1128;" />
                </p>
            </div>
        </form>
    </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Password from 'primevue/password';
import apiClient from '@/services/api';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

export default defineComponent({
    name: 'RegisterPage',
    components: {
        InputText,
        Button,
        Password,
        Toast
    },
    setup() {
        const name = ref('');
        const email = ref('');
        const password = ref('');
        const confirmPassword = ref('');
        const router = useRouter();
        const loading = ref(false);

        const toast = useToast(); // Popup Messages

        const isFormValid = computed(() => {
            return name.value.trim() !== '' && email.value.trim() !== '' && password.value.trim() !== '' && confirmPassword.value.trim() !== '';
        })

        const register = async () => {
            if (isFormValid.value) {
                loading.value = true;

                // Email validation
                const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                if (!emailPattern.test(email.value)) {
                    toast.add({ severity: 'warn', summary: 'Invalid', detail: 'Please enter a valid email address.', life: 3000 });
                    loading.value = false;
                    return;
                }

                if (password.value !== confirmPassword.value) {
                    toast.add({ severity: 'warn', summary: 'Invalid', detail: 'Passwords do not match!', life: 3000 });
                    loading.value = false;
                    return;
                }

                // Password validation
                const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
                if (!passwordPattern.test(password.value)) {
                    toast.add({ severity: 'warn', summary: 'Invalid', detail: 'Please choose a stronger password.', life: 3000 });
                    loading.value = false;
                    return;
                }

                try {
                    // Build register payload
                    const payload = {
                        name: name.value,
                        email: email.value,
                        password: password.value
                    };
                    // Make API call to backend
                    const response = await apiClient.register(payload);

                    console.log(response.data);

                    // Pass the success message as a query parameter to the login page
                    router.push({
                        path: '/login',
                        query: {
                            message: 'Thank you, ' + name.value + ', you have been registered successfully!'
                        }
                    });

                } catch (error) {
                    console.error('Registration failed:', error);
                    toast.add({ severity: 'error', summary: 'Error', detail: (error.response?.data?.detail || 'Login failed. Please try again.'), life: 3000 });
                } finally {
                    loading.value = false;
                }

            } else {
                toast.add({ severity: 'warn', summary: 'Invalid', detail: 'Please fill in all fields', life: 3000 });
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

        return { name, email, password, confirmPassword, isFormValid, loading, register, goToHome, goBack };
    }
});
</script>

<style scoped>

</style>