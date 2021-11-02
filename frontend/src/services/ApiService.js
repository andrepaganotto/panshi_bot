import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL;

export const baseApi = () => {
    const api = axios.create({ baseURL: API_URL });

    api.interceptors.request.use(async (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers[`authorization`] = token;
        return config;
    });

    api.interceptors.response.use(response => response, error => {
        if (error.response.status === 401) {
            console.error(`Redirected to login by 401!`);
            window.location = '/';
        } else return Promise.reject(error);
    });

    return api;
}