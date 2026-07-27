import axios from 'axios'

// Toute l'API Laravel est préfixée par /api/v1 (voir cahier des charges, section 3.1)
// L'URL est configurable via .env (VITE_API_URL) pour faciliter le déploiement ;
// en local, elle retombe sur l'adresse par défaut de `php artisan serve`.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: { Accept: 'application/json' },
})

// Avant chaque requête, on attache automatiquement le token Sanctum
// stocké dans localStorage (si l'utilisateur est connecté)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kaaydem_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Si l'API répond 401 (token expiré/invalide), on déconnecte proprement
// côté frontend plutôt que de laisser l'app dans un état incohérent
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kaaydem_token')
      localStorage.removeItem('kaaydem_user')
    }
    return Promise.reject(error)
  }
)

export default api
