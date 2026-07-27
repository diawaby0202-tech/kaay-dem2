import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { coordonneesVille } from '../data/villesCoordonnees'

// Correctif classique Leaflet + bundlers (Vite/Webpack) : les icônes par
// défaut ne se chargent pas correctement sans cette configuration manuelle,
// on les sert depuis un CDN plutôt que de gérer l'import des assets.
const iconeDepart = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

// Ajuste automatiquement le zoom/centre pour que les 2 points soient visibles
function AjusterVue({ points }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(points, { padding: [40, 40] })
  }, [map, points])
  return null
}

export default function CarteTrajet({ villeDepart, villeArrivee }) {
  const pointDepart = coordonneesVille(villeDepart)
  const pointArrivee = coordonneesVille(villeArrivee)

  return (
    <div className="rounded-xl overflow-hidden border border-nuit/10">
      <MapContainer
        center={pointDepart}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '260px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={pointDepart} icon={iconeDepart}>
          <Popup>Départ : {villeDepart}</Popup>
        </Marker>
        <Marker position={pointArrivee} icon={iconeDepart}>
          <Popup>Arrivée : {villeArrivee}</Popup>
        </Marker>

        <Polyline
          positions={[pointDepart, pointArrivee]}
          pathOptions={{ color: '#ff7a1a', weight: 4, dashArray: '6 8' }}
        />

        <AjusterVue points={[pointDepart, pointArrivee]} />
      </MapContainer>
    </div>
  )
}
