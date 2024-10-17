import { mount } from '@vue/test-utils';
import RegisterPage from '@/views/RegisterPage.vue';
import apiClient from '@/services/api';
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Password from 'primevue/password';
import Dialog from 'primevue/dialog';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

// Mock the apiClient module
jest.mock('@/services/api', () => ({
  register: jest.fn()
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

describe('RegisterPage.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper =  mount(RegisterPage, {
        global: {
          plugins: [PrimeVue],
          components: {
            InputText,
            Button,
            Password,
            Dialog,
            Toast,
          },
          mocks: {
            $router: mockRouter,
          }
        },
      });

    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up the mocks
    jest.clearAllMocks();
    resetUserInput();
  });

  const simulateUserInput = async (name, email, password, confirmPassword) => {
    wrapper.findAllComponents(InputText).find(input => input.attributes('id') === 'name').setValue(name);
    wrapper.findAllComponents(InputText).find(input => input.attributes('id') === 'email').setValue(email);
    wrapper.findAllComponents(Password).find(password => password.attributes('id') === 'password').setValue(password);
    wrapper.findAllComponents(Password).find(password => password.attributes('id') === 'confirmPassword').setValue(confirmPassword);
  }

  const resetUserInput = async () => {
    await wrapper.findComponent(InputText).setValue('');
    await wrapper.findComponent(Password).setValue('');
  }

  it('renders the form correctly', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('#name').exists()).toBe(true);
    expect(wrapper.find('#email').exists()).toBe(true);
    expect(wrapper.find('#password').exists()).toBe(true);
    expect(wrapper.find('#confirmPassword').exists()).toBe(true);
  });

  it('validates empty form', async () => {
    await wrapper.find('form').trigger('submit.prevent');
    // Check if the toast method was called with the right message

    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Invalid',
      detail: 'Please fill in all fields',
      life: 3000,
    });
  });

  it('validates email format', async () => {
    await simulateUserInput('John Doe', 'invalid-email', 'Password123', 'Password123');
    
    await wrapper.find('form').trigger('submit.prevent');

    // Check if the toast method was called with the right message
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Invalid',
      detail: 'Please enter a valid email address.',
      life: 3000,
    });
  });

  it('validates password confirmation', async () => {
    await simulateUserInput('John Doe', 'john@example.com', 'Password123', 'Password456');
    
    await wrapper.find('form').trigger('submit.prevent');
    // Check if the toast method was called with the right message

    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Invalid',
      detail: 'Passwords do not match!',
      life: 3000,
    });
  });

  it('validates password strength', async () => {
    await simulateUserInput('John Doe', 'john@example.com', 'weakpass', 'weakpass');
    
    await wrapper.find('form').trigger('submit.prevent');

    // Check if the toast method was called with the right message
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Invalid',
      detail: 'Please choose a stronger password.',
      life: 3000,
    });
  });
  
  it('shows loading state during form submission', async () => {
    await simulateUserInput('John Doe', 'john@example.com', 'Password123', 'Password123');
  
    apiClient.register.mockResolvedValueOnce({ data: 'success' });
  
    await wrapper.find('form').trigger('submit.prevent');
  
    expect(wrapper.findComponent(Button).props('loading')).toBe(true);
  
    await wrapper.vm.$nextTick(); // Wait for loading state to change
    expect(wrapper.findComponent(Button).props('loading')).toBe(false);
  });
  
  it('handles API errors correctly', async () => {
    await simulateUserInput('John Doe', 'john@example.com', 'Password123', 'Password123');
    
    // Mock API error
    apiClient.register.mockRejectedValueOnce({
      response: { data: { detail: 'Email already exists' } }
    });
  
    await wrapper.find('form').trigger('submit.prevent');
  
    // Check if the toast method was called with the right message
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Email already exists',
      life: 3000,
    });

  });
  
  it('redirects to login after successful registration', async () => {
    await simulateUserInput('John Doe', 'john@example.com', 'Password123', 'Password123');
  
    apiClient.register.mockResolvedValueOnce({ data: 'success' });
  
    await wrapper.find('form').trigger('submit.prevent');
    
    expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/login',
        query: {
            message: 'Thank you, ' + 'John Doe' + ', you have been registered successfully!'
        }
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
