import { Circle, MapPin } from 'lucide-react'

/**
 * Élément signature de l'identité visuelle : un mini-itinéraire — un
 * point de départ, une ligne pointillée, une épingle d'arrivée. Réutilisé
 * partout où deux villes se répondent (départ → arrivée).
 */
export default function RouteDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-1 text-or ${className}`} aria-hidden="true">
      <Circle size={9} className="shrink-0 fill-current" strokeWidth={0} />
      <span
        className="flex-1 h-0 border-t-2 border-dashed border-or/50"
        style={{ minWidth: '1.5rem' }}
      />
      <MapPin size={16} className="shrink-0 fill-or/20" strokeWidth={2} />
    </div>
  )
}
