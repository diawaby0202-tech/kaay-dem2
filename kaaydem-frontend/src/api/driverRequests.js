import api from './axios'

/** POST /driver-requests (EF-02) */
export function demanderStatutConducteur(donnees) {
  return api.post('/driver-requests', donnees)
}
