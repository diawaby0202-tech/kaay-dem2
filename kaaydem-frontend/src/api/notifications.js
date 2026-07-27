import api from './axios'

/** GET /me/notifications — compteur de la cloche (EF-06) */
export function obtenirNotifications() {
  return api.get('/me/notifications')
}
