import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import Lara from '@primevue/themes/lara'; // Import Lara theme
import ToastService from 'primevue/toastservice';

// Paths for PrimeVue CSS files
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './assets/tailwind.css'; 

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Lara,
        options: {
            prefix: 'p',
            darkModeSelector: '',
            cssLayer: {
                name: 'primevue',
                order: 'tailwind-base, tailwind-utilities, primevue'
            }
        }
    }
});

app.use(ToastService)
app.use(router);
app.mount('#app');