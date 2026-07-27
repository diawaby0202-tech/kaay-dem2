import { Link } from 'react-router-dom'
import { Clock, Star, Users } from 'lucide-react'
import RouteDivider from './RouteDivider'

const formateurDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const formateurPrix = new Intl.NumberFormat('fr-FR')

export default function TripCard({ trajet }) {
  const complet = trajet.places_disponibles === 0

  return (
    <Link
      to={`/trajets/${trajet.id}`}
      className="group flex bg-white rounded-2xl border-2 border-nuit/10 hover:border-or overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all"
    >
      {/* Bandeau latéral coloré : vert si des places restent, sombre si complet */}
      <div className={`w-2 shrink-0 ${complet ? 'bg-nuit/20' : 'bg-savane'}`} />

      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-affiche font-bold text-xl text-nuit">
                {trajet.ville_depart}
              </span>
              <RouteDivider className="w-10" />
              <span className="font-affiche font-bold text-xl text-nuit">
                {trajet.ville_arrivee}
              </span>
            </div>

            <p className="flex items-center gap-1.5 font-donnee text-xs text-nuit/50 mt-2">
              <Clock size={13} strokeWidth={2.5} />
              {formateurDate.format(new Date(trajet.date_heure_depart))}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-or to-piment flex items-center justify-center text-xs font-bold text-white shrink-0">
                {trajet.conducteur.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-nuit/70 truncate">{trajet.conducteur.name}</span>
              {trajet.conducteur.note_moyenne && (
                <span className="flex items-center gap-0.5 text-xs font-bold text-or-fonce shrink-0">
                  <Star size={12} className="fill-current" strokeWidth={0} />
                  {trajet.conducteur.note_moyenne}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0 flex flex-col items-end gap-2">
            <div className="bg-sable-fonce rounded-xl px-3 py-1.5">
              <p className="font-affiche font-extrabold text-xl text-nuit leading-none">
                {formateurPrix.format(trajet.prix_par_place)}
              </p>
              <p className="font-donnee text-[10px] font-semibold text-nuit/50 text-center mt-0.5">FCFA</p>
            </div>
            <p
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                complet ? 'bg-nuit/10 text-nuit/50' : 'bg-savane-clair text-savane'
              }`}
            >
              <Users size={12} strokeWidth={2.5} />
              {complet
                ? 'Complet'
                : `${trajet.places_disponibles} place${trajet.places_disponibles > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
