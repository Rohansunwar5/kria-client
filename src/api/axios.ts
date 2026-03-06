import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:4010', // Direct backend URL (no /api/v1/)
    withCredentials: true,
});

// Interceptor to attach token
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
