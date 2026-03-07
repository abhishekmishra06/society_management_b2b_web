import axios from 'axios';

// const apiClient = axios.create({
//   baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api`,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });


const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5001"}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token and society ID
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add society ID to all non-admin requests
      const societyId = localStorage.getItem('societyId');
      if (societyId) {
        config.headers['x-society-id'] = societyId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
       if (error.config?.url?.includes('/login')) {
        return Promise.reject(error);
      }
      
      if (typeof window !== 'undefined') {
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
