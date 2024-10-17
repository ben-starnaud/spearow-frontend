import { mount } from '@vue/test-utils';
import ForgotPasswordPage from '@/views/ForgotPasswordPage.vue';
import apiClient from '@/services/api';
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Password from 'primevue/password';
import InputOtp from 'primevue/inputotp';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

// Mock the apiClient module
jest.mock('@/services/api', () => ({
  forgotPassword: jest.fn(),
  verifyOtp: jest.fn(),
  resetPassword: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

jest.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

const mockToast = {
  add: jest.fn(), // Mock the add method of toast
}

// Mock the useToast method
jest.mock('primevue/usetoast', () => ({
  useToast: () => mockToast,
}));

describe('ForgotPasswordPage.vue', () => {
  let wrapper;
  let alertMock;

  beforeEach(() => {
    wrapper = mount(ForgotPasswordPage, {
      global: {
        plugins: [PrimeVue],
        components: {
          InputText,
          Button,
          Dialog,
          InputOtp,
          Password,
          Toast,
        },
        mocks: {
          $router: mockRouter,
        },
      },
    });

    // Mock window.alert
    alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up the mocks
    jest.clearAllMocks();
  });

  const simulateUserInput = async (email, otp) => {
    wrapper.findComponent(InputText).setValue(email);
    if (otp) {
      wrapper.findComponent(InputOtp).setValue(otp);
    }
  };

  it('renders the form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.findComponent(InputText).exists()).toBe(true);
    expect(wrapper.findComponent(Button).exists()).toBe(true);
  });

  it('validates empty email input', async () => {
    await wrapper.find('form').trigger('submit.prevent');
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Email is required',
      life: 3000,
    });
  });

  it('submits the form successfully with valid email', async () => {
    await simulateUserInput('john@example.com');

    // Mock API call response
    apiClient.forgotPassword.mockResolvedValueOnce({ data: 'success' });

    // Submit the form
    await wrapper.find('form').trigger('submit.prevent');

    // Check if the alert is called with a success message
    expect(apiClient.forgotPassword).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'OTP Sent',
      detail: 'OTP code sent to john@example.com.',
      life: 3000,
    });

  });

  it('handles API errors correctly when requesting OTP', async () => {
    await simulateUserInput('john@example.com');

    // Mock API error
    apiClient.forgotPassword.mockRejectedValueOnce({
      response: { data: { detail: 'Failed to send OTP' } },
    });

    await wrapper.find('form').trigger('submit.prevent');

    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to send OTP',
      life: 3000,
    });
  });

  it('validates empty OTP input on submission', async () => {
    await simulateUserInput('john@example.com');
    await wrapper.find('form').trigger('submit.prevent'); // Send OTP request

    await wrapper.findComponent(InputOtp).setValue(''); // Invalid OTP

    await wrapper.vm.submitOtp();

    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Invalid',
      detail: 'Please enter OTP.',
      life: 3000,
    });

  });

  it('submits OTP successfully', async () => {
    await simulateUserInput('john@example.com');
    await wrapper.find('form').trigger('submit.prevent'); // Send OTP request

    // Set valid OTP
    await wrapper.findComponent(InputOtp).setValue('123456');

    // Mock OTP verification
    apiClient.verifyOtp.mockResolvedValueOnce({ data: { message: 'OTP is valid' } });

    await wrapper.vm.submitOtp();

    expect(wrapper.vm.showPasswordFields).toBe(true);
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Choose your new password.',
      life: 3000,
    });
  });

  it('validates empty password fields', async () => {
    await simulateUserInput('john@example.com');
    wrapper.vm.showPasswordFields = true;

    // Leave password fields empty
    wrapper.vm.newPassword = '';
    wrapper.vm.confirmPassword = '';

    await wrapper.vm.resetPassword();
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Invalid',
      detail: 'Please fill in all fields',
      life: 3000,
    });

  });

  it('validates password fields and resets password', async () => {
    await simulateUserInput('john@example.com');
    wrapper.vm.showPasswordFields = true;

    // Simulate entering new password
    wrapper.vm.newPassword = 'Password123';
    wrapper.vm.confirmPassword = 'Password123';

    // Mock password reset
    apiClient.resetPassword.mockResolvedValueOnce({ data: 'success' });

    await wrapper.vm.resetPassword();

    expect(mockRouter.push).toHaveBeenCalledWith({
      path: '/login',
      query: {
        message: 'Password changed successfully!'
      }
    });
  });

  it('validates password fields mismatch', async () => {
    await simulateUserInput('john@example.com');
    wrapper.vm.showPasswordFields = true;

    // Simulate entering passwords
    wrapper.vm.newPassword = 'Password123';
    wrapper.vm.confirmPassword = 'DifferentPassword';

    await wrapper.vm.resetPassword();

    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Invalid',
      detail: 'Passwords do not match!',
      life: 3000,
    });

  });

  it('handles password reset errors correctly', async () => {
    await simulateUserInput('john@example.com');
    wrapper.vm.showPasswordFields = true;

    // Simulate entering new password
    wrapper.vm.newPassword = 'Password123';
    wrapper.vm.confirmPassword = 'Password123';

    // Mock password reset error
    apiClient.resetPassword.mockRejectedValueOnce({
      response: { data: { detail: 'Failed to reset password' } },
    });

    await wrapper.vm.resetPassword();

    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to reset password',
      life: 3000,
    });

  });

  it('calls router.push to go to home after a delay', async () => {
    // Call the goToHome method
    wrapper.vm.goToHome();

    // Wait for the delay and then check if router.push was called
    await new Promise((resolve) => setTimeout(resolve, 60)); // Wait a little longer than the delay

    expect(mockRouter.push).toHaveBeenCalledWith('/home');
  });

  it('calls router.back to go back after a delay', async () => {
    // Call the goBack method
    wrapper.vm.goBack();

    // Wait for the delay and then check if router.back was called
    await new Promise((resolve) => setTimeout(resolve, 60)); // Wait a little longer than the delay

    expect(mockRouter.back).toHaveBeenCalled();
  });

});
