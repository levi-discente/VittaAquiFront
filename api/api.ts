import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IP_ADRESS = '10.31.60.17';
const BASE_URL = `http://${IP_ADRESS}:8000`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('@vittaaqui:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
    }
    return Promise.reject(error);
  }
);

export default api;
