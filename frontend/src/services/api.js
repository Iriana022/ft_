import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});



// 2. L'intercepteur de REQUÊTE : Injecte le JWT avant que la requête ne parte
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. L'intercepteur de RÉPONSE : Gère les erreurs globales (ex: token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si on est déconnecté (Unauthorized), on nettoie et on redirige
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;