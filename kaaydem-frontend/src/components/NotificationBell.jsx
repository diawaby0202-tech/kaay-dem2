import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { obtenirNotifications } from '../api/notifications'

const INTERVALLE_RAFRAICHISSEMENT_MS = 30_000

/**
 * Cloche de notifications (EF-06) : affiche un badge avec le nombre
 * d'éléments qui attendent une action de l'utilisateur (demandes de
 * réservation en attente s'il est conducteur, avis à laisser s'il est
 * passager). Rafraîchi périodiquement pendant que l'utilisateur est
 * connecté, sans dépendre de WebSockets.
 */
export default function NotificationBell() {
  const navigate = useNavigate()
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let annule = false

    function charger() {
      obtenirNotifications()
        .then((res) => {
          if (!annule) setTotal(res.data.total)
        })
        .catch(() => {
          // Silencieux : une cloche qui échoue à se rafraîchir ne doit pas
          // perturber le reste de la navigation
        })
    }

    charger()
    const intervalle = setInterval(charger, INTERVALLE_RAFRAICHISSEMENT_MS)
    return () => {
      annule = true
      clearInterval(intervalle)
    }
  }, [])

  return (
    <button
      onClick={() => navigate('/tableau-de-bord')}
      className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/15 transition"
      aria-label={total > 0 ? `${total} notification(s) en attente` : 'Aucune notification'}
    >
      <Bell size={19} className="text-white" strokeWidth={2.25} />
      {total > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-piment text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {total > 9 ? '9+' : total}
        </span>
      )}
    </button>
  )
}
