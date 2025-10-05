// utils/backendAxios.js
import axios from 'axios';

const backendAxios = axios.create({
    baseURL: process.env.BACKEND_URL || 'http://localhost:3000',
});

export default backendAxios;