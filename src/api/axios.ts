import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';
const baseURL = isDevelopment ? 'http://localhost:4010' : 'https://kria-server.onrender.com';

const API = axios.create({
    baseURL,
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
