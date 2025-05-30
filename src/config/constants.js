export const API_HOST = import.meta.env.VITE_API_HOST || 'http://127.0.0.1:3000';
export const API_ENDPOINTS = {
    LOGIN: `${API_HOST}/api/login`,
    SIGNUP: `${API_HOST}/api/signup`,
    REQUEST_RESET: `${API_HOST}/api/resetPassword`,
    RESET_PASSWORD: `${API_HOST}/api/resetPassword`,
    ME: `${API_HOST}/api/me`,
}; 