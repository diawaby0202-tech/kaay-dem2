import api from './axios'

/** GET /reservations/{id}/messages */
export function listerMessages(reservationId) {
  return api.get(`/reservations/${reservationId}/messages`)
}

/** POST /reservations/{id}/messages */
export function envoyerMessage(reservationId, contenu) {
  return api.post(`/reservations/${reservationId}/messages`, { contenu })
}
