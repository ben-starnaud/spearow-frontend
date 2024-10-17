import { mount } from '@vue/test-utils';
import DataUploadPage from '@/views/DataUploadPage.vue';

describe('DataUploadPage.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(DataUploadPage);
    window.alert = jest.fn();
  });

  it('renders the upload form', () => {
    expect(wrapper.find('h2').text()).toBe('Upload Your Custom Data');
    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').text()).toBe('Upload Data');
  });

  it('displays the response message when uploading', async () => {
    // Simulate file upload
    const fileInput = wrapper.find('input[type="file"]');
    const file = new Blob(['test data'], { type: 'text/plain' });
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
    });
    await fileInput.trigger('change');

    expect(wrapper.vm.selectedFile).toBeInstanceOf(Blob);
    expect(wrapper.vm.selectedFile.size).toBe(file.size);

    // Simulate the upload process
    await wrapper.vm.uploadData();
    expect(wrapper.vm.message).toBe('Data uploaded successfully.');
    expect(wrapper.vm.isUploading).toBe(true);
  });

  it('handles file selection', async () => {
    const fileInput = wrapper.find('input[type="file"]');
    const file = new Blob(['test data'], { type: 'text/plain' });
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
    });
    await fileInput.trigger('change');

    expect(wrapper.vm.selectedFile).toBe(file);
  });

  it('does not set a message if no file is selected', async () => {
    await wrapper.vm.uploadData(); // No file selected
    expect(wrapper.vm.message).toBe('');
    expect(wrapper.vm.isUploading).toBe(false);
  });
});
