import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { mesTrajets } from '../api/trips'
import { mesReservations } from '../api/reservations'
import Layout from '../components/Layout'
import DriverRequestForm from '../components/DriverRequestForm'
import PublishTripForm from '../components/PublishTripForm'
import MyTripCard from '../components/MyTripCard'
import MyReservationCard from '../components/MyReservationCard'
import EditProfileForm from '../components/EditProfileForm'
import WalletSection from '../components/WalletSection'
import { Car, Inbox, ShieldAlert, Ticket } from 'lucide-react'

const LABELS_VALIDATION = {
  en_attente: {
    texte: 'Votre demande de statut conducteur est en attente de validation.',
    classe: 'bg-or/20 text-or-fonce',
  },
  rejete: {
    texte: 'Votre demande de statut conducteur a été rejetée par un administrateur.',
    classe: 'bg-piment-clair text-piment',
  },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [trajets, setTrajets] = useState([])
  const [reservations, setReservations] = useState([])
  const [chargement, setChargement] = useState(true)

  const rechargerDonnees = useCallback(() => {
    setChargement(true)
    Promise.all([mesTrajets(), mesReservations()])
      .then(([resTrajets, resReservations]) => {
        setTrajets(resTrajets.data.data)
        setReservations(resReservations.data.data)
      })
      .finally(() => setChargement(false))
  }, [])

  useEffect(() => {
    rechargerDonnees()
  }, [rechargerDonnees])

  const statutDemande = user?.driver_profile?.statut_validation

  return (
    <Layout>
      {/* Bandeau profil */}
      <div className="bg-gradient-to-br from-nuit to-nuit-clair px-6 py-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-or flex items-center justify-center font-affiche font-extrabold text-2xl text-white shrink-0 shadow-lg">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-donnee text-xs text-white/50 uppercase tracking-wider">Mon espace</p>
            <h2 className="font-affiche text-2xl font-bold text-white">{user?.name}</h2>
            <EditProfileForm user={user} />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-8 pb-10">
        <WalletSection solde={user?.solde} />

        {/* --- Bloc conducteur --- */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-savane-clair flex items-center justify-center shrink-0">
              <Car size={16} className="text-savane" strokeWidth={2.5} />
            </div>
            <h3 className="font-affiche font-bold text-lg text-nuit">Conducteur</h3>
          </div>

          {user?.est_conducteur_valide ? (
            <div className="space-y-3">
              <PublishTripForm onPublie={rechargerDonnees} />
              {!chargement &&
                trajets.map((trajet) => (
                  <MyTripCard key={trajet.id} trajet={trajet} onChange={rechargerDonnees} />
                ))}
              {!chargement && trajets.length === 0 && (
                <div className="flex flex-col items-center gap-2 text-center py-8 bg-white rounded-2xl border-2 border-dashed border-nuit/15">
                  <Ticket size={28} className="text-nuit/25" strokeWidth={1.5} />
                  <p className="text-sm text-nuit/40">Vous n'avez pas encore publié de trajet.</p>
                </div>
              )}
            </div>
          ) : statutDemande && LABELS_VALIDATION[statutDemande] ? (
            <p
              className={`flex items-center gap-2 text-sm rounded-2xl px-4 py-3 font-semibold ${LABELS_VALIDATION[statutDemande].classe}`}
            >
              <ShieldAlert size={18} strokeWidth={2.5} />
              {LABELS_VALIDATION[statutDemande].texte}
            </p>
          ) : (
            <DriverRequestForm />
          )}
        </section>

        {/* --- Bloc passager --- */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-or/15 flex items-center justify-center shrink-0">
              <Ticket size={16} className="text-or-fonce" strokeWidth={2.5} />
            </div>
            <h3 className="font-affiche font-bold text-lg text-nuit">Mes réservations</h3>
          </div>

          {chargement && (
            <p className="font-donnee text-sm text-nuit/40 text-center py-4">Chargement…</p>
          )}

          {!chargement && reservations.length === 0 && (
            <div className="flex flex-col items-center gap-2 text-center py-8 bg-white rounded-2xl border-2 border-dashed border-nuit/15">
              <Inbox size={28} className="text-nuit/25" strokeWidth={1.5} />
              <p className="text-sm text-nuit/40">Vous n'avez pas encore réservé de trajet.</p>
            </div>
          )}

          <div className="space-y-3">
            {!chargement &&
              reservations.map((r) => (
                <MyReservationCard key={r.id} reservation={r} onChange={rechargerDonnees} />
              ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
