import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1', // Bizim Gateway portu
});

// Hər sorğudan əvvəl tokeni yoxlayan və əlavə edən "Mühafizəçi"
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    // Yalnız token həqiqətən varsa və "undefined" deyilsə Header-ə əlavə et
    if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        // Əgər token yoxdursa, köhnə başlıqları təmizlə
        delete config.headers.Authorization;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;