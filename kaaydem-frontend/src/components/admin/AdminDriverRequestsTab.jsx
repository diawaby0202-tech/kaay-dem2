import { useEffect, useState } from 'react'
import { listerDemandesConducteur, traiterDemandeConducteur } from '../../api/admin'

const LABELS = {
  en_attente: { texte: 'En attente', classe: 'bg-or/20 text-or-fonce' },
  valide: { texte: 'Validé', classe: 'bg-savane-clair text-savane' },
  rejete: { texte: 'Rejeté', classe: 'bg-piment-clair text-piment' },
}

export default function AdminDriverRequestsTab() {
  const [demandes, setDemandes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [enCours, setEnCours] = useState(null)

  function charger() {
    setChargement(true)
    listerDemandesConducteur()
      .then((res) => setDemandes(res.data.data))
      .finally(() => setChargement(false))
  }

  useEffect(charger, [])

  async function traiter(id, statut) {
    setEnCours(id)
    try {
      await traiterDemandeConducteur(id, statut)
      charger()
    } finally {
      setEnCours(null)
    }
  }

  if (chargement) {
    return <p className="font-donnee text-sm text-nuit/40 text-center py-8">Chargement…</p>
  }

  if (demandes.length === 0) {
    return <p className="text-sm text-nuit/40 text-center py-8">Aucune demande pour l'instant.</p>
  }

  return (
    <div className="space-y-2">
      {demandes.map((d) => (
        <div key={d.id} className="bg-white rounded-2xl border-2 border-nuit/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-nuit">{d.user.name}</p>
              <p className="text-xs text-nuit/50">
                {d.vehicule_marque} {d.vehicule_modele} · {d.immatriculation} · Permis n°{d.numero_permis}
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${LABELS[d.statut_validation]?.classe}`}
            >
              {LABELS[d.statut_validation]?.texte}
            </span>
          </div>

          {d.statut_validation === 'en_attente' && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => traiter(d.id, 'rejete')}
                disabled={enCours === d.id}
                className="text-xs font-bold text-piment hover:bg-piment-clair px-2.5 py-1.5 rounded-full transition disabled:opacity-50"
              >
                Rejeter
              </button>
              <button
                onClick={() => traiter(d.id, 'valide')}
                disabled={enCours === d.id}
                className="text-xs font-bold bg-savane text-white hover:bg-savane/90 px-2.5 py-1.5 rounded-full transition disabled:opacity-50"
              >
                Valider
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
