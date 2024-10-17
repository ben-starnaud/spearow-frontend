import { mount } from '@vue/test-utils';
import ReportsPage from '@/views/ReportsPage.vue';
import { state } from '@/state';
import PrimeVue from 'primevue/config';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import RadioButton from 'primevue/radiobutton';
import apiClient from '@/services/api';

jest.mock('@/services/api', () => ({
  fetchReports: jest.fn(),
}));

const mockToast = {
    add: jest.fn(), // Mock the add method of toast
  }
  
  // Mock the useToast method
jest.mock('primevue/usetoast', () => ({
    useToast: () => mockToast,
}));

describe('ReportsPage', () => {
  let wrapper;

  beforeEach(() => {
    // Create a new wrapper for the component
    wrapper = mount(ReportsPage, {
        global: {
          plugins: [PrimeVue],
          components: {
            RadioButton,
            Toast
          },
        },
      });
    // Set initial state for testing
    state.submittedID = true; // Mocking the submittedID to be valid
    state.isVerified = true; // Mocking the user verification state
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear any mock calls after each test
  });

  test('renders the report generator form', () => {
    expect(wrapper.find('h2').text()).toBe('Generate Your Custom Report');
    expect(wrapper.find('select#reportType').exists()).toBe(true);
    expect(wrapper.find('select#reportFormat').exists()).toBe(true);
  });

  test('validates single breach site input', async () => {
    // Set the report category to singleBreachedSite
    wrapper.vm.reportCategory = 'singleBreachedSite';

    // Initially, the error should be empty
    expect(wrapper.vm.singleBreachSiteError).toBe('');

    // Trigger validation without a breach site
    wrapper.vm.singleBreachSite = '';
    await wrapper.vm.$nextTick();
    wrapper.vm.validateSingleBreachSite();

    // Now, an error should be present
    expect(wrapper.vm.singleBreachSiteError).toBe('Breach site cannot be empty');
  });

  test('shows toast for invalid ID or unverified user', async () => {

    // Case 1: Submitted ID is not present
    state.submittedID = false; // Set to false for testing
    await wrapper.vm.generateReport();
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Please Upload a Valid ID',
      detail: 'Go to "My Account" and upload your ID first.',
      life: 3000,
    });

    // Case 2: User is not verified
    state.submittedID = true; // Set to true for valid ID
    state.isVerified = false; // Set to false for unverified user
    await wrapper.vm.generateReport();
    expect(mockToast.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Not Verified Yet',
      detail: 'Please wait until you are verified.',
      life: 3000,
    });
  });
});
