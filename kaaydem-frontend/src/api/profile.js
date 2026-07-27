import api from './axios'

/**
 * PUT /me — modifier son propre profil (name, telephone, campus, photo?)
 * L'upload de fichier ne fonctionne pas de façon fiable avec un vrai PUT
 * multipart côté PHP : on envoie donc un POST avec `_method=PUT`
 * (spoofing de méthode standard de Laravel), qui route exactement vers
 * le même contrôleur que si on avait fait un PUT direct.
 */
export function modifierMonProfil({ name, telephone, campus, photo }) {
  const donnees = new FormData()
  donnees.append('_method', 'PUT')
  if (name != null) donnees.append('name', name)
  if (telephone != null) donnees.append('telephone', telephone)
  if (campus != null) donnees.append('campus', campus)
  if (photo) donnees.append('photo', photo)

  return api.post('/me', donnees, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
