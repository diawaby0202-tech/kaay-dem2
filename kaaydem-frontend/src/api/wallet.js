import api from './axios'

/** GET /me/transactions — historique du portefeuille virtuel */
export function obtenirTransactions() {
  return api.get('/me/transactions')
}
