import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000', 
});


apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); 
  if (token) {
    // Authorization token automatically added by the interceptor
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default {
  login(data) {
    return apiClient.post('/login', data); 
  },
  register(data) {
    return apiClient.post('/register', data); 
  },
  fetchHomeData() {
    return apiClient.get('/home');
  },
  fetchReports(data) {
    return apiClient.post('/reports', data);
  },
  getDataClasses() {
    return apiClient.get('/dataclasses');
  },
  uploadData(formData, config = {}) {
    return apiClient.post('/data-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  },
  verifyOtp(data) {
    return apiClient.post('/verify-otp', data);
  },
  forgotPassword(data) {
    return apiClient.post('/forgot-password', data);
  },
  resetPassword(data) {
    return apiClient.post('/reset-password', data);
  },
  getUserInfo() {
    return apiClient.get('/get-user-info');
  },
  uploadID(formData) {
    return apiClient.post('/uploadID', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getUsers() {
    return apiClient.get('/user-data');
  },
  getUserReport(data) {
    return apiClient.post('/user-report', data);
  },
  updateAdminStatus(userId, isAdmin) {
    return apiClient.patch(`/user/${userId}/admin-status`, { admin: isAdmin });
  },
  updateVerifiedStatus(userId, isVerified) {
    return apiClient.patch(`/user/${userId}/verify-status`, { verified: isVerified });
  },
  sendVerifiedEmail(userId) {
    return apiClient.post(`/user/${userId}/send-verified-email`);
  },
  getUnverifiedUploads() {
    return apiClient.get('/admin/unverified-uploads');
  },
  verifyUpload(uploadId) {
    return apiClient.post(`/admin/verify-upload/${uploadId}`);
  }
};