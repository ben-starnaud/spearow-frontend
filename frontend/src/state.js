import { reactive } from 'vue';

export const state = reactive({
  isAuthenticated: sessionStorage.getItem('isAuthenticated') === 'true',
  isVerified: false,
  isAdmin: false,
  submittedID: false
});