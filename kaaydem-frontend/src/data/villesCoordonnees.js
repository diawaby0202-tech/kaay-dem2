// Coordonnées approximatives des villes/campus couverts par Kaay Dem !
// (Dakar, Rufisque, Diamniadio et environs — voir cahier des charges 1.1)
// Format : [latitude, longitude]
export const COORDONNEES_VILLES = {
  'Dakar': [14.6928, -17.4467],
  'Rufisque': [14.7167, -17.2667],
  'Diamniadio': [14.7167, -17.1833],
  'Bargny': [14.6989, -17.2261],
  'Sébikotane': [14.75, -17.1333],
  'Thiès': [14.791, -16.9359],
}

/**
 * Retourne les coordonnées d'une ville, ou le centre de Dakar par défaut
 * si la ville n'est pas répertoriée (ex : nouvelle ville tapée librement
 * par un conducteur lors de la publication d'un trajet).
 */
export function coordonneesVille(nomVille) {
  return COORDONNEES_VILLES[nomVille] || COORDONNEES_VILLES['Dakar']
}
