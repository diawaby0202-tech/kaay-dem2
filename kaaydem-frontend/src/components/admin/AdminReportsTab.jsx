import { useEffect, useState } from 'react'
import { listerSignalements, traiterSignalement } from '../../api/admin'

const LABELS = {
  en_attente: { texte: 'En attente', classe: 'bg-or/20 text-or-fonce' },
  traite: { texte: 'Traité', classe: 'bg-savane-clair text-savane' },
  rejete: { texte: 'Rejeté', classe: 'bg-nuit/10 text-nuit/50' },
}

export default function AdminReportsTab() {
  const [signalements, setSignalements] = useState([])
  const [chargement, setChargement] = useState(true)
  const [enCours, setEnCours] = useState(null)

  function charger() {
    setChargement(true)
    listerSignalements()
      .then((res) => setSignalements(res.data.data))
      .finally(() => setChargement(false))
  }

  useEffect(charger, [])

  async function traiter(id, statut) {
    setEnCours(id)
    try {
      await traiterSignalement(id, statut)
      charger()
    } finally {
      setEnCours(null)
    }
  }

  if (chargement) {
    return <p className="font-donnee text-sm text-nuit/40 text-center py-8">Chargement…</p>
  }

  if (signalements.length === 0) {
    return <p className="text-sm text-nuit/40 text-center py-8">Aucun signalement pour l'instant.</p>
  }

  return (
    <div className="space-y-2">
      {signalements.map((s) => (
        <div key={s.id} className="bg-white rounded-2xl border-2 border-nuit/10 px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-nuit">
              {s.auteur.name} → {s.utilisateur_signale.name}
            </p>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${LABELS[s.statut_traitement]?.classe}`}
            >
              {LABELS[s.statut_traitement]?.texte}
            </span>
          </div>
          <p className="text-sm text-nuit/60">{s.motif}</p>

          {s.statut_traitement === 'en_attente' && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => traiter(s.id, 'rejete')}
                disabled={enCours === s.id}
                className="text-xs font-bold text-nuit/50 hover:bg-nuit/5 px-2.5 py-1.5 rounded-full transition disabled:opacity-50"
              >
                Rejeter
              </button>
              <button
                onClick={() => traiter(s.id, 'traite')}
                disabled={enCours === s.id}
                className="text-xs font-bold bg-savane text-white hover:bg-savane/90 px-2.5 py-1.5 rounded-full transition disabled:opacity-50"
              >
                Marquer traité
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
