import { useState } from 'react'
import { publierTrajet } from '../api/trips'
import { Calendar, Coins, MapPin, Plus, Users, X } from 'lucide-react'

function Champ({ icone: Icone, label, erreur, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-nuit/60 mb-1.5">
        <Icone size={13} strokeWidth={2.5} />
        {label}
      </span>
      {children}
      {erreur && <span className="text-xs text-piment font-medium mt-1 block">{erreur}</span>}
    </label>
  )
}

const classeInput =
  'w-full px-3.5 py-2.5 rounded-xl border-2 border-nuit/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition'

export default function PublishTripForm({ onPublie }) {
  const [ouvert, setOuvert] = useState(false)
  const [form, setForm] = useState({
    ville_depart: '',
    ville_arrivee: '',
    date_heure_depart: '',
    places_totales: 4,
    prix_par_place: '',
  })
  const [erreurs, setErreurs] = useState({})
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  function gererChangement(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function champErreur(nom) {
    return erreurs[nom]?.[0]
  }

  async function gererEnvoi(e) {
    e.preventDefault()
    setErreurs({})
    setEnvoiEnCours(true)

    try {
      // datetime-local renvoie "2026-08-01T14:30", Laravel attend un format
      // qu'il comprend nativement — on remplace juste le "T" par un espace
      const donnees = {
        ...form,
        date_heure_depart: form.date_heure_depart.replace('T', ' '),
        places_totales: Number(form.places_totales),
        prix_par_place: Number(form.prix_par_place),
      }
      await publierTrajet(donnees)
      setForm({
        ville_depart: '',
        ville_arrivee: '',
        date_heure_depart: '',
        places_totales: 4,
        prix_par_place: '',
      })
      setOuvert(false)
      onPublie?.()
    } catch (err) {
      if (err.response?.status === 422) {
        setErreurs(err.response.data.errors || {})
      } else {
        setErreurs({ general: [err.response?.data?.message || 'Impossible de publier ce trajet.'] })
      }
    } finally {
      setEnvoiEnCours(false)
    }
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-nuit/20 text-nuit/60 hover:border-or hover:text-or-fonce hover:bg-or/5 transition text-sm font-bold"
      >
        <Plus size={16} strokeWidth={2.5} />
        Publier un nouveau trajet
      </button>
    )
  }

  return (
    <form onSubmit={gererEnvoi} className="bg-white rounded-2xl border-2 border-nuit/10 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-affiche font-bold text-lg text-nuit">Nouveau trajet</h3>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-nuit/40 hover:bg-nuit/10 hover:text-nuit transition"
          aria-label="Annuler"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {erreurs.general && (
        <div className="mb-4 px-3 py-2.5 rounded-xl bg-piment-clair text-piment text-sm font-semibold">
          {erreurs.general[0]}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Champ icone={MapPin} label="Ville de départ" erreur={champErreur('ville_depart')}>
          <input
            name="ville_depart"
            required
            value={form.ville_depart}
            onChange={gererChangement}
            placeholder="Dakar"
            className={classeInput}
          />
        </Champ>
        <Champ icone={MapPin} label="Ville d'arrivée" erreur={champErreur('ville_arrivee')}>
          <input
            name="ville_arrivee"
            required
            value={form.ville_arrivee}
            onChange={gererChangement}
            placeholder="Diamniadio"
            className={classeInput}
          />
        </Champ>
      </div>

      <div className="mb-3">
        <Champ icone={Calendar} label="Date et heure de départ" erreur={champErreur('date_heure_depart')}>
          <input
            type="datetime-local"
            name="date_heure_depart"
            required
            value={form.date_heure_depart}
            onChange={gererChangement}
            className={classeInput}
          />
        </Champ>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Champ icone={Users} label="Places totales">
          <input
            type="number"
            name="places_totales"
            min="1"
            max="8"
            required
            value={form.places_totales}
            onChange={gererChangement}
            className={classeInput}
          />
        </Champ>
        <Champ icone={Coins} label="Prix par place (FCFA)">
          <input
            type="number"
            name="prix_par_place"
            min="0"
            required
            value={form.prix_par_place}
            onChange={gererChangement}
            placeholder="1500"
            className={classeInput}
          />
        </Champ>
      </div>

      <button
        type="submit"
        disabled={envoiEnCours}
        className="w-full py-3 rounded-xl bg-or hover:bg-or-fonce disabled:opacity-50 text-white font-affiche font-bold text-sm transition shadow-md"
      >
        {envoiEnCours ? 'Publication…' : 'Publier le trajet'}
      </button>
    </form>
  )
}
