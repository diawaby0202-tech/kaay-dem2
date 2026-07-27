import { useEffect, useState } from 'react'
import { listerUtilisateurs, changerStatutUtilisateur } from '../../api/admin'
import { ShieldCheck } from 'lucide-react'

export default function AdminUsersTab() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [chargement, setChargement] = useState(true)
  const [enCours, setEnCours] = useState(null)

  function charger() {
    setChargement(true)
    listerUtilisateurs()
      .then((res) => setUtilisateurs(res.data.data))
      .finally(() => setChargement(false))
  }

  useEffect(charger, [])

  async function basculer(user) {
    setEnCours(user.id)
    try {
      await changerStatutUtilisateur(user.id, !user.is_active)
      charger()
    } finally {
      setEnCours(null)
    }
  }

  if (chargement) {
    return <p className="font-donnee text-sm text-nuit/40 text-center py-8">Chargement…</p>
  }

  return (
    <div className="space-y-2">
      {utilisateurs.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between bg-white rounded-2xl border-2 border-nuit/10 px-4 py-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-or to-piment flex items-center justify-center font-bold text-white text-sm shrink-0">
              {u.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-nuit flex items-center gap-1 truncate">
                {u.name}
                {u.is_admin && <ShieldCheck size={13} className="text-or-fonce shrink-0" strokeWidth={2.5} />}
              </p>
              <p className="text-xs text-nuit/50 truncate">{u.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                u.is_active ? 'bg-savane-clair text-savane' : 'bg-piment-clair text-piment'
              }`}
            >
              {u.is_active ? 'Actif' : 'Désactivé'}
            </span>
            {!u.is_admin && (
              <button
                onClick={() => basculer(u)}
                disabled={enCours === u.id}
                className="text-xs font-bold border-2 border-nuit/15 hover:border-nuit/30 px-2.5 py-1 rounded-full transition disabled:opacity-50"
              >
                {u.is_active ? 'Désactiver' : 'Activer'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
