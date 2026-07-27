import { useState } from 'react'
import { demanderStatutConducteur } from '../api/driverRequests'
import { useAuth } from '../context/AuthContext'
import { Car, CheckCircle2, IdCard, ScrollText } from 'lucide-react'

const classeInput =
  'w-full px-3.5 py-2.5 rounded-xl border-2 border-nuit/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition'

export default function DriverRequestForm() {
  const { rafraichirUser } = useAuth()
  const [form, setForm] = useState({
    numero_permis: '',
    vehicule_marque: '',
    vehicule_modele: '',
    immatriculation: '',
  })
  const [erreur, setErreur] = useState(null)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [succes, setSucces] = useState(false)

  function gererChangement(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function gererEnvoi(e) {
    e.preventDefault()
    setErreur(null)
    setEnvoiEnCours(true)

    try {
      await demanderStatutConducteur(form)
      setSucces(true)
      await rafraichirUser() // pour afficher immédiatement le statut "en attente"
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible d\'envoyer la demande.')
    } finally {
      setEnvoiEnCours(false)
    }
  }

  if (succes) {
    return (
      <div className="flex items-center gap-2 bg-savane-clair text-savane rounded-2xl px-4 py-3 text-sm font-semibold">
        <CheckCircle2 size={18} strokeWidth={2.5} className="shrink-0" />
        Votre demande a été envoyée et est en attente de validation par un administrateur.
      </div>
    )
  }

  return (
    <form onSubmit={gererEnvoi} className="bg-white rounded-2xl border-2 border-nuit/10 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Car size={18} className="text-or-fonce" strokeWidth={2.5} />
        <h3 className="font-affiche font-bold text-lg text-nuit">Devenir conducteur</h3>
      </div>
      <p className="text-sm text-nuit/60 mb-4">
        Renseignez votre permis et votre véhicule pour publier des trajets.
      </p>

      {erreur && (
        <div className="mb-4 px-3 py-2.5 rounded-xl bg-piment-clair text-piment text-sm font-semibold">
          {erreur}
        </div>
      )}

      <label className="block mb-3">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-nuit/60 mb-1.5">
          <IdCard size={13} strokeWidth={2.5} />
          Numéro de permis
        </span>
        <input
          name="numero_permis"
          required
          value={form.numero_permis}
          onChange={gererChangement}
          className={classeInput}
        />
      </label>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="block text-xs font-semibold text-nuit/60 mb-1.5">Marque</span>
          <input
            name="vehicule_marque"
            required
            value={form.vehicule_marque}
            onChange={gererChangement}
            placeholder="Toyota"
            className={classeInput}
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-nuit/60 mb-1.5">Modèle</span>
          <input
            name="vehicule_modele"
            required
            value={form.vehicule_modele}
            onChange={gererChangement}
            placeholder="Corolla"
            className={classeInput}
          />
        </label>
      </div>

      <label className="block mb-5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-nuit/60 mb-1.5">
          <ScrollText size={13} strokeWidth={2.5} />
          Immatriculation
        </span>
        <input
          name="immatriculation"
          required
          value={form.immatriculation}
          onChange={gererChangement}
          placeholder="DK-1234-AB"
          className={classeInput}
        />
      </label>

      <button
        type="submit"
        disabled={envoiEnCours}
        className="w-full py-3 rounded-xl bg-or hover:bg-or-fonce disabled:opacity-50 text-white font-affiche font-bold text-sm transition shadow-md"
      >
        {envoiEnCours ? 'Envoi…' : 'Envoyer ma demande'}
      </button>
    </form>
  )
}
