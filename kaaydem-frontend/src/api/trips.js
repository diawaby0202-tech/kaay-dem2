import api from './axios'

/** GET /trips avec filtres optionnels (EF-04). Public, pas besoin de token. */
export function rechercherTrajets(filtres = {}) {
  // On retire les filtres vides pour ne pas envoyer "ville_depart=" inutilement
  const params = Object.fromEntries(
    Object.entries(filtres).filter(([, valeur]) => valeur !== '' && valeur != null)
  )
  return api.get('/trips', { params })
}

export function obtenirTrajet(id) {
  return api.get(`/trips/${id}`)
}

/** POST /trips/{id}/reservations (EF-05). Nécessite d'être connecté. */
export function reserverTrajet(id, nombrePlaces) {
  return api.post(`/trips/${id}/reservations`, { nombre_places: nombrePlaces })
}

/** GET /me/trips — mes trajets publiés en tant que conducteur (EF-08) */
export function mesTrajets() {
  return api.get('/me/trips')
}

/** POST /trips — publier un nouveau trajet (EF-03) */
export function publierTrajet(donnees) {
  return api.post('/trips', donnees)
}

/** PATCH /trips/{id}/close — clôturer un trajet */
export function cloturerTrajet(id) {
  return api.patch(`/trips/${id}/close`)
}

/** PUT /trips/{id} — modifier un trajet (EF-03, bloqué si résa confirmée) */
export function modifierTrajet(id, donnees) {
  return api.put(`/trips/${id}`, donnees)
}

/** DELETE /trips/{id} — annuler un trajet (EF-03, bloqué si résa confirmée) */
export function annulerTrajet(id) {
  return api.delete(`/trips/${id}`)
}
