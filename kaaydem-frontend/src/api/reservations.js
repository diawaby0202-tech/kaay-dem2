import api from './axios'

/** GET /me/reservations — mes réservations en tant que passager (EF-08) */
export function mesReservations() {
  return api.get('/me/reservations')
}

/** PATCH /reservations/{id}/accept (EF-06) */
export function accepterReservation(id) {
  return api.patch(`/reservations/${id}/accept`)
}

/** PATCH /reservations/{id}/refuse (EF-06) */
export function refuserReservation(id) {
  return api.patch(`/reservations/${id}/refuse`)
}

/** PATCH /reservations/{id}/cancel */
export function annulerReservation(id) {
  return api.patch(`/reservations/${id}/cancel`)
}

/** POST /reservations/{id}/review (EF-07) */
export function laisserAvis(id, note, commentaire) {
  return api.post(`/reservations/${id}/review`, { note, commentaire })
}

/** POST /reservations/{id}/report */
export function signalerReservation(id, motif) {
  return api.post(`/reservations/${id}/report`, { motif })
}
