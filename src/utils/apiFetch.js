import { API_URL } from '../config/api';

/**
 * A wrapper around the native fetch API that automatically handles attaching the access token
 * and transparently refreshing it if a 401 Unauthorized error occurs.
 */
export const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('token');

    // Configure default headers
    const headers = {
        ...options.headers,
    };

    if (token) {
        headers['x-auth-token'] = token;
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    // 1. Initial Request
    let response = await fetch(url, config);

    // 2. If token expired, attempt refresh
    if (response.status === 401) {
        try {
            const refreshRes = await fetch(`${API_URL}/auth/refresh-token`, {
                method: 'POST',
                credentials: 'include' // crucial for sending HTTP-Only cookies
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                if (data.token) {
                    // Save new token
                    token = data.token;
                    localStorage.setItem('token', token);

                    // Re-attach new token
                    config.headers['x-auth-token'] = token;
                    config.headers['Authorization'] = `Bearer ${token}`;

                    // 3. Retry original request
                    response = await fetch(url, config);
                }
            } else {
                // Refresh failed completely (e.g. refresh token expired)
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Could forcibly redirect to login here: window.location.href = '/login';
            }
        } catch (err) {
            console.error('Failed to refresh token during fetchWithAuth:', err);
        }
    }

    return response;
};
