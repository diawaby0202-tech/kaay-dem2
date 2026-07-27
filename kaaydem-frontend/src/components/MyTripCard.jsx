import { useState } from 'react'
import { accepterReservation, refuserReservation, signalerReservation } from '../api/reservations'
import { annulerTrajet, cloturerTrajet, modifierTrajet } from '../api/trips'
import RouteDivider from './RouteDivider'
import MessagePanel from './MessagePanel'
import { Flag, MessageCircle, Pencil, X } from 'lucide-react'

const formateurDate = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const LABELS_STATUT = {
  en_attente: { texte: 'En attente', classe: 'bg-or/20 text-or-fonce' },
  confirmee: { texte: 'Confirmée', classe: 'bg-savane-clair text-savane' },
  refusee: { texte: 'Refusée', classe: 'bg-piment-clair text-piment' },
  annulee: { texte: 'Annulée', classe: 'bg-nuit/10 text-nuit/50' },
  terminee: { texte: 'Terminée', classe: 'bg-nuit/10 text-nuit/70' },
}

const classeInput =
  'w-full px-3 py-2 rounded-lg border-2 border-nuit/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition'

// Formate une date ISO en valeur compatible avec <input type="datetime-local">
function versDatetimeLocal(dateIso) {
  const d = new Date(dateIso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function BoutonSignalerPassager({ reservationId }) {
  const [ouvert, setOuvert] = useState(false)
  const [motif, setMotif] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)

  if (envoye) {
    return <span className="text-xs font-bold text-piment">Signalé</span>
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="flex items-center gap-1 text-xs font-bold text-nuit/40 hover:text-piment transition"
      >
        <Flag size={11} strokeWidth={2.5} />
        Signaler
      </button>
    )
  }

  async function envoyer(e) {
    e.preventDefault()
    setEnCours(true)
    setErreur(null)
    try {
      await signalerReservation(reservationId, motif)
      setEnvoye(true)
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible d\'envoyer le signalement.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <form onSubmit={envoyer} className="w-full mt-2 bg-piment-clair/40 rounded-xl p-3">
      {erreur && <p className="text-xs text-piment font-semibold mb-2">{erreur}</p>}
      <textarea
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        placeholder="Décrivez le problème rencontré (10 caractères minimum)"
        required
        minLength={10}
        rows={2}
        className="w-full text-sm px-3 py-2 rounded-lg border-2 border-piment/20 mb-2 focus:outline-none focus:ring-2 focus:ring-piment/40"
      />
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOuvert(false)} className="text-xs font-bold text-nuit/50 px-2">
          Annuler
        </button>
        <button
          type="submit"
          disabled={enCours}
          className="text-xs font-bold bg-piment hover:bg-piment/90 text-white px-3 py-1.5 rounded-full transition disabled:opacity-50"
        >
          {enCours ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>
    </form>
  )
}

export default function MyTripCard({ trajet, onChange }) {
  const [enCours, setEnCours] = useState(null) // id de la réservation (ou 'cloture'/'annulation'/'modification') en cours
  const [erreur, setErreur] = useState(null)
  const [editionOuverte, setEditionOuverte] = useState(false)
  const [formEdition, setFormEdition] = useState({
    ville_depart: trajet.ville_depart,
    ville_arrivee: trajet.ville_arrivee,
    date_heure_depart: versDatetimeLocal(trajet.date_heure_depart),
    places_totales: trajet.places_totales,
    prix_par_place: trajet.prix_par_place,
  })

  async function gererAction(action, reservationId) {
    setEnCours(reservationId)
    setErreur(null)
    try {
      if (action === 'accepter') await accepterReservation(reservationId)
      if (action === 'refuser') await refuserReservation(reservationId)
      onChange?.()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Action impossible.')
    } finally {
      setEnCours(null)
    }
  }

  async function gererCloture() {
    setEnCours('cloture')
    setErreur(null)
    try {
      await cloturerTrajet(trajet.id)
      onChange?.()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de clôturer ce trajet.')
    } finally {
      setEnCours(null)
    }
  }

  async function gererAnnulationTrajet() {
    if (!window.confirm('Annuler définitivement ce trajet ? Cette action est irréversible.')) return
    setEnCours('annulation')
    setErreur(null)
    try {
      await annulerTrajet(trajet.id)
      onChange?.()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible d\'annuler ce trajet.')
    } finally {
      setEnCours(null)
    }
  }

  async function gererModification(e) {
    e.preventDefault()
    setEnCours('modification')
    setErreur(null)
    try {
      await modifierTrajet(trajet.id, {
        ...formEdition,
        date_heure_depart: formEdition.date_heure_depart.replace('T', ' '),
        places_totales: Number(formEdition.places_totales),
        prix_par_place: Number(formEdition.prix_par_place),
      })
      setEditionOuverte(false)
      onChange?.()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible de modifier ce trajet.')
    } finally {
      setEnCours(null)
    }
  }

  const aReservationConfirmee = trajet.reservations?.some((r) => r.statut === 'confirmee')
  const peutCloturer = trajet.statut !== 'termine' && trajet.statut !== 'annule'
  const peutModifierOuAnnuler =
    ['publie', 'complet'].includes(trajet.statut) && !aReservationConfirmee
  const reservationsEnAttente = trajet.reservations?.filter((r) => r.statut === 'en_attente') || []
  const autresReservations = trajet.reservations?.filter((r) => r.statut !== 'en_attente') || []

  return (
    <div className="talon-billet bg-white rounded-3xl border-2 border-nuit/10 pl-5 pr-7 py-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="font-affiche font-semibold text-nuit">{trajet.ville_depart}</span>
          <RouteDivider className="w-7 h-7" />
          <span className="font-affiche font-semibold text-nuit">{trajet.ville_arrivee}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {peutModifierOuAnnuler && !editionOuverte && (
            <button
              onClick={() => setEditionOuverte(true)}
              className="flex items-center gap-1 text-xs font-bold text-nuit/50 hover:text-nuit border-2 border-nuit/15 hover:border-nuit/30 rounded-full px-2.5 py-1 transition"
            >
              <Pencil size={12} strokeWidth={2.5} />
              Modifier
            </button>
          )}
          {peutModifierOuAnnuler && (
            <button
              onClick={gererAnnulationTrajet}
              disabled={enCours === 'annulation'}
              className="flex items-center gap-1 text-xs font-bold text-piment hover:bg-piment-clair border-2 border-piment/20 rounded-full px-2.5 py-1 transition disabled:opacity-50"
            >
              <X size={12} strokeWidth={2.5} />
              {enCours === 'annulation' ? 'Annulation…' : 'Annuler'}
            </button>
          )}
          {peutCloturer && (
            <button
              onClick={gererCloture}
              disabled={enCours === 'cloture'}
              className="text-xs font-bold text-nuit/50 hover:text-nuit border-2 border-nuit/15 hover:border-nuit/30 rounded-full px-2.5 py-1 transition disabled:opacity-50"
            >
              {enCours === 'cloture' ? 'Clôture…' : 'Clôturer'}
            </button>
          )}
        </div>
      </div>

      <p className="font-donnee text-xs text-nuit/50 mt-1">
        {formateurDate.format(new Date(trajet.date_heure_depart))} · {trajet.places_disponibles}/
        {trajet.places_totales} places libres
      </p>

      {erreur && (
        <p className="text-xs text-piment bg-piment-clair rounded-lg px-3 py-2 mt-3">{erreur}</p>
      )}

      {editionOuverte && (
        <form onSubmit={gererModification} className="mt-3 bg-sable rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={formEdition.ville_depart}
              onChange={(e) => setFormEdition({ ...formEdition, ville_depart: e.target.value })}
              placeholder="Ville de départ"
              className={classeInput}
              required
            />
            <input
              value={formEdition.ville_arrivee}
              onChange={(e) => setFormEdition({ ...formEdition, ville_arrivee: e.target.value })}
              placeholder="Ville d'arrivée"
              className={classeInput}
              required
            />
          </div>
          <input
            type="datetime-local"
            value={formEdition.date_heure_depart}
            onChange={(e) => setFormEdition({ ...formEdition, date_heure_depart: e.target.value })}
            className={classeInput}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="1"
              max="8"
              value={formEdition.places_totales}
              onChange={(e) => setFormEdition({ ...formEdition, places_totales: e.target.value })}
              className={classeInput}
              required
            />
            <input
              type="number"
              min="0"
              value={formEdition.prix_par_place}
              onChange={(e) => setFormEdition({ ...formEdition, prix_par_place: e.target.value })}
              className={classeInput}
              required
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setEditionOuverte(false)}
              className="text-xs font-bold text-nuit/50 px-2.5 py-1.5"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={enCours === 'modification'}
              className="text-xs font-bold bg-or hover:bg-or-fonce text-white px-3 py-1.5 rounded-full transition disabled:opacity-50"
            >
              {enCours === 'modification' ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {reservationsEnAttente.length === 0 && autresReservations.length === 0 && (
        <p className="text-sm text-nuit/40 mt-3">Aucune réservation pour l'instant.</p>
      )}

      {reservationsEnAttente.length > 0 && (
        <div className="mt-4 space-y-2">
          {reservationsEnAttente.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between bg-sable rounded-lg px-3 py-2.5"
            >
              <span className="text-sm text-nuit">
                {r.passager.name} <span className="text-nuit/40">· {r.nombre_places} place(s)</span>
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => gererAction('refuser', r.id)}
                  disabled={enCours === r.id}
                  className="text-xs font-medium text-piment hover:bg-piment-clair px-2.5 py-1 rounded-md transition disabled:opacity-50"
                >
                  Refuser
                </button>
                <button
                  onClick={() => gererAction('accepter', r.id)}
                  disabled={enCours === r.id}
                  className="text-xs font-medium bg-savane text-white hover:bg-savane/90 px-2.5 py-1 rounded-md transition disabled:opacity-50"
                >
                  Accepter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {autresReservations.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {autresReservations.map((r) => (
            <LigneAutreReservation key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  )
}

function LigneAutreReservation({ reservation: r }) {
  const [messagerieOuverte, setMessagerieOuverte] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between px-1 flex-wrap gap-y-1">
        <span className="text-sm text-nuit/60">{r.passager.name}</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${LABELS_STATUT[r.statut]?.classe}`}
          >
            {LABELS_STATUT[r.statut]?.texte}
          </span>
          {['confirmee', 'terminee'].includes(r.statut) && (
            <>
              <button
                onClick={() => setMessagerieOuverte((v) => !v)}
                className="flex items-center gap-1 text-xs font-bold text-nuit/40 hover:text-nuit transition"
              >
                <MessageCircle size={11} strokeWidth={2.5} />
                Messages
              </button>
              <BoutonSignalerPassager reservationId={r.id} />
            </>
          )}
        </div>
      </div>
      {messagerieOuverte && (
        <MessagePanel reservationId={r.id} onFermer={() => setMessagerieOuverte(false)} />
      )}
    </div>
  )
}
