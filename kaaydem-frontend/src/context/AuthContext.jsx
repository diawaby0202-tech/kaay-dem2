import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [chargement, setChargement] = useState(true)

  // Au premier chargement de l'app : si un token existe déjà (session
  // précédente), on récupère le profil pour restaurer la connexion
  useEffect(() => {
    const token = localStorage.getItem('kaaydem_token')
    if (!token) {
      setChargement(false)
      return
    }

    api
      .get('/me')
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem('kaaydem_token')
      })
      .finally(() => setChargement(false))
  }, [])

  async function connexion(email, password) {
    const res = await api.post('/login', { email, password })
    localStorage.setItem('kaaydem_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function inscription(donnees) {
    const res = await api.post('/register', donnees)
    localStorage.setItem('kaaydem_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function deconnexion() {
    try {
      await api.post('/logout')
    } finally {
      localStorage.removeItem('kaaydem_token')
      setUser(null)
    }
  }

  // Permet à d'autres pages (ex: profil modifié) de mettre à jour
  // l'utilisateur en mémoire sans refaire un appel /me
  function mettreAJourUser(nouvelUser) {
    setUser(nouvelUser)
  }

  // Recharge le profil depuis l'API (ex: après une demande conducteur,
  // pour voir immédiatement le nouveau statut_validation)
  async function rafraichirUser() {
    const res = await api.get('/me')
    setUser(res.data.data)
  }

  return (
    <AuthContext.Provider
      value={{ user, chargement, connexion, inscription, deconnexion, mettreAJourUser, rafraichirUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexte = useContext(AuthContext)
  if (!contexte) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>')
  }
  return contexte
}
