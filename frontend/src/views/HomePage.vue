<template>
  <div class="home-background relative">
    <!-- Toast -->
    <Toast class="z-50"/>

    <!-- Top Section - Protect Your Data -->
    <div class="relative max-w-7xl 3xl:max-w-9xl">

      <!-- Content Container -->
      <div class="relative grid grid-cols-1 lg:grid-cols-2 mt-40 md:mt-20 lg:mt-40 3xl:mt-48">
        <!-- Left Text Section -->
        <div class="md:mt-24 content ml-10 2xl:ml-0">
          <h1 class="text-7xl font-extrabold mb-4 md:mb-6 text-white font-roboto">Protect Your Data</h1>
          <p class="text-2xl mb-5 font-roboto text-white font-light">
            Stay ahead of security threats by generating personalized breach reports in seconds.
          </p>
          <button
            class="bg-transparent border-2 border-white text-white text-2xl tracking-wider font-semibold py-3 px-5 lg:px-6 rounded-full hover:shadow-md transform transition-transform hover:scale-103 active:scale-100"
            @click="goToReports">
            Generate Report
          </button>
        </div>

        <!-- Right Phones Section -->
        <div class="relative justify-end hidden lg:flex z-2 -mb-24 -mt-4 -mr-3">
          <!-- Phones Image -->
          <img src="@/assets/top_phones.svg" alt="Phones" class="w-full max-w-xl lg:max-w-none">
        </div>
      </div>

    </div>

    <!-- "How it works" panel -->
    <div
      class="bg-white py-16 mt-20 lg:mt-0 rounded-2xl shadow-xl max-w-8xl 3xl:max-w-9xl px-8 content transform transition-transform hover:scale-101">
      <h2 class="text-6xl font-extrabold text-center mb-12 text-primaryText font-roboto">
        How it works
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-16">
        <!-- First Box -->
        <div
          class="text-center border-4 border-[#1D1128] rounded-xl p-2 shadow-lg transform transition-transform hover:scale-101 active:scale-100">
          <img src="@/assets/otp_icon.svg" alt="Create Account" class="mx-auto mb-2">
          <p class="font-normal text-xl mb-3 px-3 leading-10 text-primaryText font-roboto">
            Create an account and verify your account to get started. It’s quick, easy, and secure.
          </p>
        </div>
        <!-- Second Box -->
        <div
          class="text-center border-4 border-[#1D1128] rounded-xl p-2 shadow-lg transform transition-transform hover:scale-101 active:scale-100">
          <img src="@/assets/breach_scan_icon.svg" alt="Scan Breach" class="mx-auto mb-2">
          <p class="font-normal text-xl mb-3 px-3 leading-10 text-primaryText font-roboto">
            Our system scans breach databases and cross-checks your information against known data leaks.
          </p>
        </div>
        <!-- Third Box -->
        <div
          class="text-center border-4 border-[#1D1128] rounded-xl p-2 shadow-lg transform transition-transform hover:scale-101 active:scale-100">
          <img src="@/assets/report_icon.svg" alt="Detailed Report" class="mx-auto mb-2">
          <p class="font-normal text-xl mb-3 px-3 leading-10 text-primaryText font-roboto">
            Receive a detailed report showing which breaches exposed your data and what actions you can take.
          </p>
        </div>
      </div>
    </div>

    <!-- "Account Safety" panel -->
    <div
      class="bg-white pb-12 mt-16 rounded-2xl shadow-xl max-w-8xl 3xl:max-w-9xl px-8 content transform transition-transform hover:scale-101">
      <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-x-12">
        <!-- Text Section -->
        <div>
          <h2 class="text-6xl font-extrabold mb-12 pt-16 text-primaryText font-roboto">
            Account Safety
          </h2>
          <p class="text-xl font-normal leading-10 text-primaryText font-roboto">
            Every time a report is generated for your email, you will be notified immediately. Our platform also uses
            One-Time Passwords (OTP) for login and authentication, adding an extra layer of security. This guarantees
            that only you have access to your sensitive data and report, keeping your account safe from unauthorized
            access.
          </p>
        </div>
        <!-- Image Section -->
        <div class="flex justify-center pt-10">
          <img src="@/assets/account_safety_image.svg" alt="Account Safety"
            class="max-w-full transform transition-transform hover:scale-101 active:scale-100">
        </div>
      </div>
    </div>

    <!-- "Your Security, Our Priority" panel -->
    <div
      class="bg-white pt-14 mt-16 rounded-2xl shadow-xl max-w-8xl 3xl:max-w-9xl px-8 z-10 transform transition-transform hover:scale-101">
      <div class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-10 gap-y-3 items-center">
        <!-- Image Section -->
        <div class="flex justify-start md:ml-[-2rem]">
          <img src="@/assets/security_phone_image.svg" alt="Security Phone"
            class="max-w-full transform transition-transform hover:scale-101 active:scale-100">
        </div>

        <!-- Text Section -->
        <div>
          <h2 class="text-6xl font-extrabold mb-12 text-primaryText font-roboto">
            Your Security, Our Priority
          </h2>
          <p class="text-xl font-normal leading-10 text-primaryText font-roboto">
            We prioritize your security. All data is encrypted, and we never store personal information beyond what's
            necessary to generate your report. Your privacy and safety are always at the forefront of everything we do.
          </p>
          <p class="text-xl font-normal leading-10 mt-6 pb-12 text-primaryText font-roboto">
            We follow industry-leading security practices to ensure that your data is always protected. From secure
            connections to encrypted data handling, we make sure that your information stays private and out of the
            wrong hands. You can trust that our platform is built with your safety in mind.
          </p>
        </div>
      </div>
    </div>

    <!-- Footer Shape -->
    <div class="absolute w-full bottom-0 content">
      <img src="@/assets/footer_shape.svg" alt="Footer Shape" class="w-full h-auto" />
    </div>

    <Divider class="footer-divider mt-32 content" />

    <!-- Footer Content -->
    <footer class="relative grid grid-cols-2 justify-between items-center w-full pb-5 pt-4 content">
      <p class="text-base text-left px-4 md:px-8 font-roboto font-light" style="color: #E2E8F0;">&copy; 2024 Spearow.
        All rights reserved.</p>
      <p class="text-base text-right px-4 md:px-8 font-roboto font-light" style="color: #E2E8F0;">
        spearow.pwned@gmail.com</p>
    </footer>

  </div>
</template>

<script>
import { defineComponent } from 'vue';
import Divider from 'primevue/divider';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import { onMounted } from 'vue';
import { state } from '@/state';

export default defineComponent({
  name: 'HomePage',
  components: {
    Divider,
    Toast
  },
  setup() {

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

    const router = useRouter();

    const goToReports = () => {

      if (!state.isAuthenticated) {
        toast.add({ severity: 'warn', summary: 'Not Authorized', detail: 'Please Log In or Create an Account first.', life: 3000 });
      } else {
        setTimeout(() => {
          router.push('/reports');
        }, 50); // milliseconds delay
      }

    };

    return { goToReports };
  }
});
</script>

<style scoped>
.footer-divider {
  background-color: #1D1128;
  height: 1px;
  width: 90%;
}
</style>