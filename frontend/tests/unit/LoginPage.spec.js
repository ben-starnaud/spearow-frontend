import { mount, shallowMount } from '@vue/test-utils';
import LoginPage from '@/views/LoginPage.vue';
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Password from 'primevue/password';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';


const mockRouter = {
  currentRoute: {
    value: {
      query: {
        message: '',
      },
    },
  },
  push: jest.fn(),
  replace: jest.fn(),
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

describe('LoginPage.vue', () => {
 // let toastMock;
  let mockLogin;
  let wrapper;

  beforeEach(() => {
    // Create a new wrapper for the component
    wrapper = mount(LoginPage, {
      global: {
        plugins: [PrimeVue],
        components: {
          InputText,
          Button,
          Password,
          Dialog,
          Toast
        },
        mocks: {
          $router: mockRouter,
        }
      },
    });

    //console.log(wrapper.html());

    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockLogin = jest.fn(() => Promise.resolve({ data: { message: 'OTP sent' } }));

    // Reset session storage
    sessionStorage.clear();

    // Reset mockRouter.push before each test
    mockRouter.push.mockReset();

  });

  afterEach(() => {
    // Clean up the mocks
    jest.clearAllMocks();
    //resetUserInput();
  });

  const simulateUserInput = async (email, password) => {

    await wrapper.findComponent(InputText).setValue(email);
    await wrapper.findComponent(Password).setValue(password);
  }

  const resetUserInput = async () => {

    await wrapper.findComponent(InputText).setValue('');
    await wrapper.findComponent(Password).setValue('');
  }

  it('should render the login form and elements correctly', async () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('h1').text()).toBe('Login to your Account');
    expect(wrapper.findComponent(InputText).exists()).toBe(true); // Email input
    expect(wrapper.findComponent(Password).exists()).toBe(true); // Password input
    expect(wrapper.findComponent(Button).exists()).toBe(true); // Login button
  });

  it('should disable login button when only password is empty', async () => {
    await simulateUserInput('test@mail.com', '');
  
    await wrapper.vm.$nextTick();
  
    const loginButton = wrapper.findAllComponents(Button).find(button => button.props('label') === 'Login');
    expect(loginButton.attributes('disabled')).toBe('');
  });

  it('should disable login button when only email is empty', async () => {
    await simulateUserInput('', 'password');
  
    await wrapper.vm.$nextTick();
  
    const loginButton = wrapper.findAllComponents(Button).find(button => button.props('label') === 'Login');
    expect(loginButton.attributes('disabled')).toBe('');
  });

  it('should disable login button when email or password is empty', async () => {

    await resetUserInput();

    // Force an update
    await wrapper.vm.$nextTick();

    const loginButton = wrapper.findAllComponents(Button).find(button => button.props('label') === 'Login');

    // Check if the button exists
    expect(loginButton.exists()).toBe(true);

    // Initially, the username and password are empty, so the button should be disabled
    expect(loginButton.attributes('disabled')).toBe('');
  });  

  it('calls toast warn when form submission is empty', async () => {

    // Trigger form submission with empty fields
    await wrapper.find('form').trigger('submit.prevent');

    // Check if the toast method was called with the right message
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Invalid',
      detail: 'Please enter email and password.',
      life: 3000,
    });

  });

  it('should call the login function when the form is submitted', async () => {
    //apiClient.login = mockLogin; // Mock the login API call
    wrapper.vm.login = mockLogin;

    //simulate user input
    await simulateUserInput('test@mail.com', 'password');
  
    // Trigger the form submission
    await wrapper.find('form').trigger('submit.prevent');
    
    // Ensure the login function is called
    expect(mockLogin).toHaveBeenCalled();
  });

  it('should inform user when otp is sent', async () => {

    apiClient.login = mockLogin;

    //simulate user input
    await simulateUserInput('test@mail.com', 'password')

    await wrapper.vm.login();

    // Wait for Vue to complete its DOM updates
    await wrapper.vm.$nextTick();

    // Assert that otpRequired is set to true
    expect(wrapper.vm.otpRequired).toBe(true);

    // Check if the toast method was called with the right message
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'OTP Sent',
      detail: 'OTP code sent to test@mail.com.',
      life: 3000,
    });
    
  });
  
  it('should show OTP dialog when OTP is required', async () => {

    apiClient.login = mockLogin;

    //simulate user input
    await simulateUserInput('test@mail.com', 'password')

    await wrapper.vm.login();

    // Wait for Vue to complete its DOM updates
    await wrapper.vm.$nextTick();

    // Assert that otpRequired is set to true
    expect(wrapper.vm.otpRequired).toBe(true);

    const otpDialog = wrapper.findComponent(Dialog);

    // Ensure the OTP dialog is visible
    expect(otpDialog.props('visible')).toBe(true);
  });
  
  it('submits OTP when entered', async () => {

    // Mock the OTP submit API call
    wrapper.vm.otpRequired = true;
    wrapper.vm.otp = '123456';
    const mockOtpSubmit = jest.fn(() => Promise.resolve({ data: { token: 'token' } }));
    wrapper.vm.submitOtp = mockOtpSubmit;
    
    // Wait for Vue to update DOM with OTP dialog
    await wrapper.vm.$nextTick();

    const submitOtpButton = wrapper.findAllComponents(Button).find(button => button.props('label') === 'Submit Code');
    expect(submitOtpButton.exists()).toBe(true);
  
    await submitOtpButton.trigger('click');
    expect(mockOtpSubmit).toHaveBeenCalled(); // Ensure OTP submit function is called
  });

  it('should resend OTP when the "Resend Code" button is clicked', async () => {
  
    // Simulate user input and OTP dialog being active
    await simulateUserInput('test@mail.com', 'password');
    wrapper.vm.otpRequired = true;
    await wrapper.vm.$nextTick();
  
    // Mock API call for resending OTP
    const mockResendOtp = mockLogin;
    apiClient.login = mockResendOtp;
    wrapper.vm.login = mockResendOtp;
  
    const resendButton = wrapper.findAllComponents(Button).find(button => button.props('label') === 'Resend Code');
    await resendButton.trigger('click');
  
    expect(mockResendOtp).toHaveBeenCalled();
  });

  it('should show an error if OTP is invalid', async () => {
  
    wrapper.vm.otpRequired = true;
    wrapper.vm.otp = '123456';
  
    // Mock failed OTP submission
    const mockOtpSubmit = jest.fn(() => Promise.reject({ response: { data: { detail: 'Invalid OTP. Please try again or request a new OTP.' } } }));
    apiClient.login = mockOtpSubmit;
  
    await wrapper.vm.$nextTick();
  
    const submitOtpButton = wrapper.findAllComponents(Button).find(button => button.props('label') === 'Submit Code');
    await submitOtpButton.trigger('click');
  
    expect(mockOtpSubmit).toHaveBeenCalled();
    await wrapper.vm.$nextTick();

    // Check if the toast method was called with the right message
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Invalid OTP. Please try again.',
      life: 3000,
    });

  });

  it ('should disable submit otp button if OTP is empty', async () => {
    wrapper.vm.otpRequired = true;
    wrapper.vm.otp = ''; 

    await wrapper.vm.$nextTick();
  
    // Trigger the form submission
    const submitOtpButton = wrapper.findAllComponents(Button).find(button => button.props('label') === 'Submit Code');

    // Check if the button exists
    expect(submitOtpButton.exists()).toBe(true);

    expect(submitOtpButton.attributes('disabled')).toBe('');

    });

  it('should login successfully and redirect to home', async () => {

    // Mock the login API call with a successful response
    const mockResponse = {
      data: {
        token: 'fake-jwt-token',
        message: 'Login successful!',
      },
    };
    apiClient.login = jest.fn().mockResolvedValue(mockResponse);
    
    //simulate user input
    await simulateUserInput('test@mail.com', 'password');

    // Trigger the form submission
    await wrapper.vm.login();

    // Assert that router.push was called with '/home'
    expect(mockRouter.push).toHaveBeenCalledWith({
        path: '/home',
        query: {
          message: 'Welcome, logged in successfully!'
        }
      });
    expect(window.sessionStorage.getItem('isAuthenticated')).toBe('true');
    expect(window.localStorage.getItem('token')).toBe('fake-jwt-token');
  });

  it('should handle login failure', async () => {
    apiClient.login = jest.fn().mockRejectedValue({
      response: { data: { detail: 'Invalid credentials' } }
    });
  
    await simulateUserInput('test@mail.com', 'password');
    await wrapper.vm.login();
  
    expect(apiClient.login).toHaveBeenCalled();
    expect(wrapper.vm.loading).toBe(false);

    // Check if the toast method was called with the right message
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Invalid credentials',
      life: 3000,
    });
  });

  it('should show loading state during login', async () => {
  
    // Mock API call delay to simulate loading
    const mockLogin = jest.fn(() => new Promise((resolve) => setTimeout(() => resolve({ data: { token: 'token' } }), 1000)));
    apiClient.login = mockLogin;
  
    await simulateUserInput('test@mail.com', 'password');
  
    const loginButton = wrapper.findAllComponents(Button).find(button => button.props('label') === 'Login');
  
    // Submit the form and check the loading state
    await wrapper.find('form').trigger('submit.prevent');
    expect(loginButton.props('loading')).toBe(true);
  
    await mockLogin();
    await wrapper.vm.$nextTick();
  
    expect(loginButton.props('loading')).toBe(false);
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
