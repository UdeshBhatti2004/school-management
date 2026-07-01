import axios from 'axios';

// File uploads use axios directly (not RTK Query) because RTK Query's
// fetchBaseQuery doesn't expose onUploadProgress. This is the only
// remaining use of axios in the project — everything else is RTK Query.
const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

// Inject the JWT from localStorage before every upload request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Uploads a file to /api/upload and returns { url, publicId, resourceType, fileName }
export async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
}
