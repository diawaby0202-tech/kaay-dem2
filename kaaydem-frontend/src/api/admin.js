import api from './axios'

// --- Utilisateurs ---
export function listerUtilisateurs() {
  return api.get('/admin/users')
}

export function changerStatutUtilisateur(id, isActive) {
  return api.patch(`/admin/users/${id}`, { is_active: isActive })
}

// --- Demandes de statut conducteur ---
export function listerDemandesConducteur() {
  return api.get('/admin/driver-requests')
}

export function traiterDemandeConducteur(id, statutValidation) {
  return api.patch(`/admin/driver-requests/${id}`, { statut_validation: statutValidation })
}

// --- Signalements ---
export function listerSignalements() {
  return api.get('/admin/reports')
}

export function traiterSignalement(id, statutTraitement) {
  return api.patch(`/admin/reports/${id}`, { statut_traitement: statutTraitement })
}

// --- Statistiques ---
export function obtenirStatistiques() {
  return api.get('/admin/stats')
}

// --- Export CSV (exigence bonus) ---
export function exporterTrajetsCSV() {
  return api.get('/admin/trips/export', { responseType: 'blob' })
}
