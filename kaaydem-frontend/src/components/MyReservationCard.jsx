import { useState } from 'react'
import { annulerReservation, laisserAvis, signalerReservation } from '../api/reservations'
import RouteDivider from './RouteDivider'
import MessagePanel from './MessagePanel'
import { Flag, MessageCircle } from 'lucide-react'

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

export default function MyReservationCard({ reservation, onChange }) {
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [formulaireAvisOuvert, setFormulaireAvisOuvert] = useState(false)
  const [note, setNote] = useState(5)
  const [commentaire, setCommentaire] = useState('')
  const [avisEnvoye, setAvisEnvoye] = useState(false)
  const [formulaireSignalementOuvert, setFormulaireSignalementOuvert] = useState(false)
  const [motifSignalement, setMotifSignalement] = useState('')
  const [signalementEnvoye, setSignalementEnvoye] = useState(false)
  const [messagerieOuverte, setMessagerieOuverte] = useState(false)

  const peutAnnuler = ['en_attente', 'confirmee'].includes(reservation.statut)
  const peutNoter = reservation.statut === 'terminee' && !avisEnvoye
  const peutSignaler = ['confirmee', 'terminee'].includes(reservation.statut) && !signalementEnvoye
  const peutMessager = ['confirmee', 'terminee'].includes(reservation.statut)

  async function gererAnnulation() {
    setEnCours(true)
    setErreur(null)
    try {
      await annulerReservation(reservation.id)
      onChange?.()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Annulation impossible.')
    } finally {
      setEnCours(false)
    }
  }

  async function gererEnvoiAvis(e) {
    e.preventDefault()
    setEnCours(true)
    setErreur(null)
    try {
      await laisserAvis(reservation.id, Number(note), commentaire)
      setAvisEnvoye(true)
      setFormulaireAvisOuvert(false)
    } catch (err) {
      // 409 = avis déjà donné pour cette réservation
      setErreur(err.response?.data?.message || 'Impossible d\'envoyer l\'avis.')
    } finally {
      setEnCours(false)
    }
  }

  async function gererEnvoiSignalement(e) {
    e.preventDefault()
    setEnCours(true)
    setErreur(null)
    try {
      await signalerReservation(reservation.id, motifSignalement)
      setSignalementEnvoye(true)
      setFormulaireSignalementOuvert(false)
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible d\'envoyer le signalement.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="talon-billet bg-white rounded-3xl border-2 border-nuit/10 pl-5 pr-7 py-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-affiche font-semibold text-nuit">{reservation.trip.ville_depart}</span>
          <RouteDivider className="w-8 h-8" />
          <span className="font-affiche font-semibold text-nuit">{reservation.trip.ville_arrivee}</span>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${LABELS_STATUT[reservation.statut]?.classe}`}
        >
          {LABELS_STATUT[reservation.statut]?.texte}
        </span>
      </div>

      <p className="font-donnee text-xs text-nuit/50 mt-1">
        {formateurDate.format(new Date(reservation.trip.date_heure_depart))} ·{' '}
        {reservation.nombre_places} place(s)
      </p>

      {erreur && (
        <p className="text-xs text-piment bg-piment-clair rounded-lg px-3 py-2 mt-3">{erreur}</p>
      )}

      {avisEnvoye && (
        <p className="text-xs text-savane bg-savane-clair rounded-lg px-3 py-2 mt-3">
          Merci pour votre avis !
        </p>
      )}

      {signalementEnvoye && (
        <p className="text-xs text-piment bg-piment-clair rounded-lg px-3 py-2 mt-3">
          Votre signalement a été transmis à l'administration.
        </p>
      )}

      <div className="flex gap-2 mt-3 flex-wrap">
        {peutAnnuler && (
          <button
            onClick={gererAnnulation}
            disabled={enCours}
            className="text-xs font-bold text-piment hover:bg-piment-clair px-2.5 py-1.5 rounded-full transition disabled:opacity-50"
          >
            Annuler
          </button>
        )}
        {peutNoter && !formulaireAvisOuvert && (
          <button
            onClick={() => setFormulaireAvisOuvert(true)}
            className="text-xs font-bold bg-or/20 text-or-fonce hover:bg-or/30 px-2.5 py-1.5 rounded-full transition"
          >
            Laisser un avis
          </button>
        )}
        {peutSignaler && !formulaireSignalementOuvert && (
          <button
            onClick={() => setFormulaireSignalementOuvert(true)}
            className="flex items-center gap-1 text-xs font-bold text-nuit/50 hover:bg-nuit/10 hover:text-nuit px-2.5 py-1.5 rounded-full transition"
          >
            <Flag size={12} strokeWidth={2.5} />
            Signaler
          </button>
        )}
        {peutMessager && (
          <button
            onClick={() => setMessagerieOuverte((v) => !v)}
            className="flex items-center gap-1 text-xs font-bold text-nuit/50 hover:bg-nuit/10 hover:text-nuit px-2.5 py-1.5 rounded-full transition"
          >
            <MessageCircle size={12} strokeWidth={2.5} />
            Messages
          </button>
        )}
      </div>

      {messagerieOuverte && (
        <MessagePanel reservationId={reservation.id} onFermer={() => setMessagerieOuverte(false)} />
      )}

      {formulaireSignalementOuvert && (
        <form onSubmit={gererEnvoiSignalement} className="mt-3 bg-piment-clair/40 rounded-xl p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-piment mb-2">
            <Flag size={13} strokeWidth={2.5} />
            Signaler le conducteur
          </p>
          <textarea
            value={motifSignalement}
            onChange={(e) => setMotifSignalement(e.target.value)}
            placeholder="Décrivez le problème rencontré (10 caractères minimum)"
            required
            minLength={10}
            rows={3}
            className="w-full text-sm px-3 py-2 rounded-lg border-2 border-piment/20 mb-2 focus:outline-none focus:ring-2 focus:ring-piment/40"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormulaireSignalementOuvert(false)}
              className="text-xs font-bold text-nuit/50 px-2.5 py-1.5"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={enCours}
              className="text-xs font-bold bg-piment hover:bg-piment/90 text-white px-3 py-1.5 rounded-full transition disabled:opacity-50"
            >
              {enCours ? 'Envoi…' : 'Envoyer le signalement'}
            </button>
          </div>
        </form>
      )}

      {formulaireAvisOuvert && (
        <form onSubmit={gererEnvoiAvis} className="mt-3 bg-sable rounded-lg p-3">
          <label className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-nuit/60">Note</span>
            <select
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-sm px-2 py-1 rounded-md border border-nuit/15"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ★
                </option>
              ))}
            </select>
          </label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Votre commentaire (optionnel)"
            rows={2}
            className="w-full text-sm px-3 py-2 rounded-md border border-nuit/15 mb-2 focus:outline-none focus:ring-2 focus:ring-or/50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormulaireAvisOuvert(false)}
              className="text-xs text-nuit/50 px-2.5 py-1.5"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={enCours}
              className="text-xs font-medium bg-or hover:bg-or-fonce px-3 py-1.5 rounded-md transition disabled:opacity-50"
            >
              {enCours ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
