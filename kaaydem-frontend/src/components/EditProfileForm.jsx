import { useState } from 'react'
import { modifierMonProfil } from '../api/profile'
import { useAuth } from '../context/AuthContext'
import { Camera, Pencil, X } from 'lucide-react'

const classeInput =
  'w-full px-3 py-2 rounded-lg border-2 border-white/20 bg-white/10 text-sm font-medium text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-or/60 focus:border-or transition'

export default function EditProfileForm({ user }) {
  const { mettreAJourUser } = useAuth()
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    telephone: user?.telephone || '',
    campus: user?.campus || '',
  })
  const [photo, setPhoto] = useState(null)
  const [apercuPhoto, setApercuPhoto] = useState(null)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)

  function gererChangementPhoto(e) {
    const fichier = e.target.files?.[0]
    if (!fichier) return
    setPhoto(fichier)
    setApercuPhoto(URL.createObjectURL(fichier))
  }

  async function gererEnvoi(e) {
    e.preventDefault()
    setEnCours(true)
    setErreur(null)
    try {
      const res = await modifierMonProfil({ ...form, photo })
      mettreAJourUser(res.data.data)
      setOuvert(false)
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de mettre à jour le profil.')
    } finally {
      setEnCours(false)
    }
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white transition mt-1"
      >
        <Pencil size={12} strokeWidth={2.5} />
        Modifier mon profil
      </button>
    )
  }

  return (
    <form onSubmit={gererEnvoi} className="mt-3 bg-white/10 rounded-2xl p-4 space-y-2.5 w-full max-w-sm">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-white/80 uppercase tracking-wide">Modifier mon profil</p>
        <button type="button" onClick={() => setOuvert(false)} className="text-white/60 hover:text-white">
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {erreur && (
        <p className="text-xs text-white bg-piment/80 rounded-lg px-3 py-2">{erreur}</p>
      )}

      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="w-12 h-12 rounded-full bg-or overflow-hidden flex items-center justify-center font-bold text-white text-lg shrink-0 relative">
          {apercuPhoto ? (
            <img src={apercuPhoto} alt="Aperçu" className="w-full h-full object-cover" />
          ) : (
            user?.name?.charAt(0)
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Camera size={16} className="text-white" strokeWidth={2.5} />
          </div>
        </div>
        <span className="text-xs font-semibold text-white/70 group-hover:text-white transition">
          Changer la photo
        </span>
        <input type="file" accept="image/*" onChange={gererChangementPhoto} className="hidden" />
      </label>

      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Nom complet"
        className={classeInput}
        required
      />
      <input
        value={form.telephone}
        onChange={(e) => setForm({ ...form, telephone: e.target.value })}
        placeholder="Téléphone"
        className={classeInput}
      />
      <input
        value={form.campus}
        onChange={(e) => setForm({ ...form, campus: e.target.value })}
        placeholder="Campus"
        className={classeInput}
      />

      <button
        type="submit"
        disabled={enCours}
        className="w-full py-2 rounded-lg bg-or hover:bg-or-fonce disabled:opacity-50 text-white font-affiche font-bold text-sm transition"
      >
        {enCours ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}
