import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { inscription } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    telephone: '',
    campus: '',
  })
  const [erreurs, setErreurs] = useState({})
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  function gererChangement(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function gererEnvoi(e) {
    e.preventDefault()
    setErreurs({})
    setEnvoiEnCours(true)

    try {
      await inscription(form)
      navigate('/tableau-de-bord')
    } catch (err) {
      // Laravel renvoie les erreurs de validation 422 sous forme
      // { errors: { champ: ["message"] } } — on les affiche champ par champ
      if (err.response?.status === 422) {
        setErreurs(err.response.data.errors || {})
      } else {
        setErreurs({ general: ['Une erreur est survenue. Réessayez.'] })
      }
    } finally {
      setEnvoiEnCours(false)
    }
  }

  function champErreur(nom) {
    return erreurs[nom]?.[0]
  }

  return (
    <div className="min-h-screen bg-sable-fonce flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-5">
        {/* Panneau coloré */}
        <div className="relative md:col-span-2 bg-gradient-to-br from-savane via-savane to-nuit p-8 flex flex-col justify-between overflow-hidden min-h-[180px]">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
          <div className="absolute bottom-4 left-1/4 w-20 h-20 rounded-full bg-white/10" aria-hidden="true" />
          <Link to="/" className="relative font-affiche text-3xl font-extrabold text-white drop-shadow-sm">
            Kaay Dem !
          </Link>
          <p className="relative text-white/90 font-medium mt-6">
            Rejoignez la communauté étudiante
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={gererEnvoi} className="md:col-span-3 p-8">
          <h2 className="font-affiche text-2xl font-bold mb-5 text-nuit">Créer un compte</h2>

          {erreurs.general && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-piment-clair text-piment text-sm font-semibold">
              {erreurs.general[0]}
            </div>
          )}

          <label className="block mb-3.5">
            <span className="block text-xs font-bold text-nuit/60 mb-1.5 uppercase tracking-wide">Nom complet</span>
            <input
              name="name"
              required
              value={form.name}
              onChange={gererChangement}
              placeholder="Aminata Diop"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-sable-fonce bg-white focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
            />
            {champErreur('name') && (
              <span className="text-xs text-piment mt-1 block font-medium">{champErreur('name')}</span>
            )}
          </label>

          <label className="block mb-3.5">
            <span className="block text-xs font-bold text-nuit/60 mb-1.5 uppercase tracking-wide">Email</span>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={gererChangement}
              placeholder="vous@esmt.sn"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-sable-fonce bg-white focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
            />
            {champErreur('email') && (
              <span className="text-xs text-piment mt-1 block font-medium">{champErreur('email')}</span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-3 mb-3.5">
            <label className="block">
              <span className="block text-xs font-bold text-nuit/60 mb-1.5 uppercase tracking-wide">Téléphone</span>
              <input
                name="telephone"
                value={form.telephone}
                onChange={gererChangement}
                placeholder="77 123 45 67"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-sable-fonce bg-white focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-bold text-nuit/60 mb-1.5 uppercase tracking-wide">Campus</span>
              <input
                name="campus"
                value={form.campus}
                onChange={gererChangement}
                placeholder="ESMT Dakar"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-sable-fonce bg-white focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
              />
            </label>
          </div>

          <label className="block mb-3.5">
            <span className="block text-xs font-bold text-nuit/60 mb-1.5 uppercase tracking-wide">Mot de passe</span>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={gererChangement}
              placeholder="8 caractères minimum"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-sable-fonce bg-white focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
            />
            {champErreur('password') && (
              <span className="text-xs text-piment mt-1 block font-medium">{champErreur('password')}</span>
            )}
          </label>

          <label className="block mb-6">
            <span className="block text-xs font-bold text-nuit/60 mb-1.5 uppercase tracking-wide">
              Confirmer le mot de passe
            </span>
            <input
              type="password"
              name="password_confirmation"
              required
              value={form.password_confirmation}
              onChange={gererChangement}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-sable-fonce bg-white focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
            />
          </label>

          <button
            type="submit"
            disabled={envoiEnCours}
            className="w-full py-3 rounded-xl bg-or hover:bg-or-fonce disabled:opacity-50 text-white font-affiche font-bold transition shadow-lg"
          >
            {envoiEnCours ? 'Création…' : 'Créer mon compte'}
          </button>

          <p className="text-center text-sm text-nuit/60 mt-5">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="text-savane font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
