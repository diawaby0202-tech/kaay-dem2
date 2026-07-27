import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { envoyerMessage, listerMessages } from '../api/messages'

const INTERVALLE_POLLING_MS = 5_000

const formateurHeure = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * Panneau de messagerie interne (exigence bonus) rattaché à une
 * réservation. Utilise un polling simple (toutes les 5s tant que le
 * panneau est ouvert) plutôt que des WebSockets — suffisant pour ce
 * cas d'usage, sans infrastructure temps réel supplémentaire.
 */
export default function MessagePanel({ reservationId, onFermer }) {
  const [messages, setMessages] = useState([])
  const [contenu, setContenu] = useState('')
  const [chargement, setChargement] = useState(true)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)
  const finDesMessagesRef = useRef(null)

  useEffect(() => {
    let annule = false

    function charger() {
      listerMessages(reservationId)
        .then((res) => {
          if (!annule) setMessages(res.data.data)
        })
        .catch((err) => {
          if (!annule) setErreur(err.response?.data?.message || 'Impossible de charger les messages.')
        })
        .finally(() => {
          if (!annule) setChargement(false)
        })
    }

    charger()
    const intervalle = setInterval(charger, INTERVALLE_POLLING_MS)
    return () => {
      annule = true
      clearInterval(intervalle)
    }
  }, [reservationId])

  useEffect(() => {
    finDesMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  async function gererEnvoi(e) {
    e.preventDefault()
    if (!contenu.trim()) return
    setEnvoiEnCours(true)
    setErreur(null)
    try {
      const res = await envoyerMessage(reservationId, contenu)
      setMessages((precedents) => [...precedents, res.data.data])
      setContenu('')
    } catch (err) {
      setErreur(err.response?.data?.message || 'Impossible d\'envoyer le message.')
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return (
    <div className="mt-3 bg-sable rounded-2xl border-2 border-nuit/10 overflow-hidden">
      <div className="flex items-center justify-between bg-nuit px-3.5 py-2.5">
        <span className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wide">
          <MessageCircle size={13} strokeWidth={2.5} />
          Messages
        </span>
        <button type="button" onClick={onFermer} className="text-white/60 hover:text-white">
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>

      <div className="max-h-56 overflow-y-auto px-3 py-2.5 space-y-2">
        {chargement && (
          <p className="font-donnee text-xs text-nuit/40 text-center py-4">Chargement…</p>
        )}

        {!chargement && messages.length === 0 && (
          <p className="text-xs text-nuit/40 text-center py-4">
            Aucun message pour l'instant. Dites bonjour !
          </p>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.est_de_moi ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.est_de_moi ? 'bg-or text-white rounded-br-sm' : 'bg-white border-2 border-nuit/10 text-nuit rounded-bl-sm'
              }`}
            >
              <p className="leading-snug">{m.contenu}</p>
              <p className={`text-[10px] mt-1 ${m.est_de_moi ? 'text-white/70' : 'text-nuit/40'}`}>
                {formateurHeure.format(new Date(m.created_at))}
              </p>
            </div>
          </div>
        ))}
        <div ref={finDesMessagesRef} />
      </div>

      {erreur && <p className="text-xs text-piment px-3 pb-2">{erreur}</p>}

      <form onSubmit={gererEnvoi} className="flex items-center gap-2 p-2.5 bg-white border-t-2 border-nuit/10">
        <input
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Écrire un message…"
          maxLength={2000}
          className="flex-1 px-3 py-2 rounded-full border-2 border-nuit/10 text-sm focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
        />
        <button
          type="submit"
          disabled={envoiEnCours || !contenu.trim()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-or hover:bg-or-fonce disabled:opacity-40 text-white transition shrink-0"
          aria-label="Envoyer"
        >
          <Send size={15} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  )
}
