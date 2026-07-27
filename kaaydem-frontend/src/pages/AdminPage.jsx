import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import AdminUsersTab from '../components/admin/AdminUsersTab'
import AdminDriverRequestsTab from '../components/admin/AdminDriverRequestsTab'
import AdminReportsTab from '../components/admin/AdminReportsTab'
import AdminStatsTab from '../components/admin/AdminStatsTab'
import { BarChart3, FileWarning, IdCard, ShieldCheck, Users } from 'lucide-react'

const ONGLETS = [
  { cle: 'stats', label: 'Statistiques', icone: BarChart3 },
  { cle: 'demandes', label: 'Demandes conducteur', icone: IdCard },
  { cle: 'utilisateurs', label: 'Utilisateurs', icone: Users },
  { cle: 'signalements', label: 'Signalements', icone: FileWarning },
]

export default function AdminPage() {
  const { user } = useAuth()
  const [ongletActif, setOngletActif] = useState('stats')

  // Double sécurité : même si un non-admin arrivait ici, le backend
  // refuserait de toute façon (Gate::define('admin')) — mais autant
  // éviter d'afficher la page pour rien côté frontend aussi
  if (!user?.is_admin) {
    return <Navigate to="/" replace />
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-nuit to-nuit-clair px-6 py-8">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-or flex items-center justify-center shrink-0 shadow-lg">
            <ShieldCheck size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-donnee text-xs text-white/50 uppercase tracking-wider">Administration</p>
            <h2 className="font-affiche text-xl font-bold text-white">Tableau de bord admin</h2>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-6 pb-10">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {ONGLETS.map((o) => (
            <button
              key={o.cle}
              onClick={() => setOngletActif(o.cle)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition shadow-sm ${
                ongletActif === o.cle
                  ? 'bg-or text-white shadow-md'
                  : 'bg-white text-nuit/60 hover:text-nuit border-2 border-nuit/10'
              }`}
            >
              <o.icone size={15} strokeWidth={2.5} />
              {o.label}
            </button>
          ))}
        </div>

        {ongletActif === 'stats' && <AdminStatsTab />}
        {ongletActif === 'demandes' && <AdminDriverRequestsTab />}
        {ongletActif === 'utilisateurs' && <AdminUsersTab />}
        {ongletActif === 'signalements' && <AdminReportsTab />}
      </div>
    </Layout>
  )
}
