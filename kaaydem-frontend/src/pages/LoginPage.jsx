import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { connexion } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState(null)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  async function gererEnvoi(e) {
    e.preventDefault()
    setErreur(null)
    setEnvoiEnCours(true)

    try {
      await connexion(email, motDePasse)
      navigate('/tableau-de-bord')
    } catch (err) {
      // 422 = ValidationException Laravel (identifiants incorrects)
      // 403 = compte désactivé par un admin
      const message =
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Une erreur est survenue. Réessayez.'
      setErreur(message)
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return (
    <div className="min-h-screen bg-sable-fonce flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* Panneau coloré */}
        <div className="relative bg-gradient-to-br from-or via-or-fonce to-piment p-8 flex flex-col justify-between overflow-hidden min-h-[220px]">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
          <div className="absolute bottom-4 left-1/3 w-20 h-20 rounded-full bg-white/10" aria-hidden="true" />
          <Link to="/" className="relative font-affiche text-3xl font-extrabold text-white drop-shadow-sm">
            Kaay Dem !
          </Link>
          <p className="relative text-white/90 font-medium mt-6">
            Le covoiturage étudiant Dakar · Rufisque · Diamniadio
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={gererEnvoi} className="p-8 flex flex-col justify-center">
          <h2 className="font-affiche text-2xl font-bold mb-5 text-nuit">Se connecter</h2>

          {erreur && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-piment-clair text-piment text-sm font-semibold">
              {erreur}
            </div>
          )}

          <label className="block mb-4">
            <span className="block text-xs font-bold text-nuit/60 mb-1.5 uppercase tracking-wide">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@esmt.sn"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-sable-fonce bg-white focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
            />
          </label>

          <label className="block mb-6">
            <span className="block text-xs font-bold text-nuit/60 mb-1.5 uppercase tracking-wide">Mot de passe</span>
            <input
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-sable-fonce bg-white focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
            />
          </label>

          <button
            type="submit"
            disabled={envoiEnCours}
            className="w-full py-3 rounded-xl bg-or hover:bg-or-fonce disabled:opacity-50 text-white font-affiche font-bold transition shadow-lg"
          >
            {envoiEnCours ? 'Connexion…' : 'Se connecter'}
          </button>

          <p className="text-center text-sm text-nuit/60 mt-5">
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="text-savane font-bold hover:underline">
              S'inscrire
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
