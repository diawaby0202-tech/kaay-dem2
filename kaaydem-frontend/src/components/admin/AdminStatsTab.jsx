import { useEffect, useState } from 'react'
import { exporterTrajetsCSV, obtenirStatistiques } from '../../api/admin'
import { Download, Gauge, TrendingUp, Trophy } from 'lucide-react'

const NOMS_MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

function libelleMois(cle) {
  const [, mois] = cle.split('-')
  return NOMS_MOIS[Number(mois) - 1]
}

export default function AdminStatsTab() {
  const [stats, setStats] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [exportEnCours, setExportEnCours] = useState(false)

  useEffect(() => {
    obtenirStatistiques()
      .then((res) => setStats(res.data))
      .finally(() => setChargement(false))
  }, [])

  async function gererExport() {
    setExportEnCours(true)
    try {
      const res = await exporterTrajetsCSV()
      // Le fichier arrive en blob : on crée une URL temporaire pour
      // déclencher le téléchargement, comme le ferait un vrai lien <a href>
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const lien = document.createElement('a')
      lien.href = url
      lien.download = `trajets-kaaydem-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(lien)
      lien.click()
      lien.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setExportEnCours(false)
    }
  }

  if (chargement) {
    return <p className="font-donnee text-sm text-nuit/40 text-center py-8">Chargement…</p>
  }

  if (!stats) return null

  const maxTrajets = Math.max(...stats.trajets_par_mois.map((m) => m.total), 1)

  return (
    <div className="space-y-6">
      {/* Export CSV (exigence bonus) */}
      <div className="flex justify-end">
        <button
          onClick={gererExport}
          disabled={exportEnCours}
          className="flex items-center gap-1.5 text-xs font-bold bg-white border-2 border-nuit/10 hover:border-or text-nuit px-3.5 py-2 rounded-full transition disabled:opacity-50"
        >
          <Download size={13} strokeWidth={2.5} />
          {exportEnCours ? 'Export…' : 'Exporter les trajets (CSV)'}
        </button>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border-2 border-nuit/10 p-4">
          <Gauge size={18} className="text-or-fonce mb-2" strokeWidth={2.5} />
          <p className="text-xs text-nuit/50 uppercase tracking-wide font-semibold">Taux d'occupation moyen</p>
          <p className="font-affiche font-extrabold text-3xl text-nuit mt-1">
            {stats.taux_occupation_moyen}%
          </p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-nuit/10 p-4">
          <TrendingUp size={18} className="text-savane mb-2" strokeWidth={2.5} />
          <p className="text-xs text-nuit/50 uppercase tracking-wide font-semibold">Trajets ce mois-ci</p>
          <p className="font-affiche font-extrabold text-3xl text-nuit mt-1">
            {stats.trajets_par_mois[stats.trajets_par_mois.length - 1]?.total ?? 0}
          </p>
        </div>
      </div>

      {/* Graphique en barres : trajets par mois (EF-08 : "au moins un graphique") */}
      <div className="bg-white rounded-2xl border-2 border-nuit/10 p-5">
        <p className="text-sm font-bold text-nuit/70 mb-4">Trajets publiés par mois</p>
        <div className="flex items-end gap-3 h-32">
          {stats.trajets_par_mois.map((m) => (
            <div key={m.mois} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="font-donnee text-xs text-nuit/60">{m.total}</span>
              <div
                className="w-full bg-gradient-to-t from-or-fonce to-or rounded-t-lg transition-all"
                style={{ height: `${Math.max((m.total / maxTrajets) * 100, 4)}%` }}
              />
              <span className="text-xs text-nuit/40 font-medium">{libelleMois(m.mois)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top conducteurs */}
      <div className="bg-white rounded-2xl border-2 border-nuit/10 p-5">
        <div className="flex items-center gap-1.5 mb-3">
          <Trophy size={15} className="text-or-fonce" strokeWidth={2.5} />
          <p className="text-sm font-bold text-nuit/70">Top conducteurs</p>
        </div>
        {stats.top_conducteurs.length === 0 ? (
          <p className="text-sm text-nuit/40">Aucun trajet terminé pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {stats.top_conducteurs.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-sm text-nuit font-medium">
                  <span className="text-white bg-nuit/70 font-donnee text-xs mr-2 rounded-full w-5 h-5 inline-flex items-center justify-center">{i + 1}</span>
                  {c.name}
                </span>
                <span className="text-xs text-nuit/50 font-medium">
                  {c.nombre_trajets} trajet{c.nombre_trajets > 1 ? 's' : ''}
                  {c.note_moyenne && <span className="text-or-fonce font-bold ml-2">★ {c.note_moyenne}</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
