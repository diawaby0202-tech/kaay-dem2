import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { obtenirTrajet, reserverTrajet } from '../api/trips'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import RouteDivider from '../components/RouteDivider'
import CarteTrajet from '../components/CarteTrajet'

const formateurDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

const formateurPrix = new Intl.NumberFormat('fr-FR')

export default function TripDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [trajet, setTrajet] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreurChargement, setErreurChargement] = useState(null)

  const [nombrePlaces, setNombrePlaces] = useState(1)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [erreurReservation, setErreurReservation] = useState(null)
  const [succes, setSucces] = useState(false)

  useEffect(() => {
    obtenirTrajet(id)
      .then((res) => setTrajet(res.data.data))
      .catch(() => setErreurChargement('Ce trajet est introuvable ou n\'existe plus.'))
      .finally(() => setChargement(false))
  }, [id])

  async function gererReservation(e) {
    e.preventDefault()
    setErreurReservation(null)
    setEnvoiEnCours(true)

    try {
      await reserverTrajet(id, Number(nombrePlaces))
      setSucces(true)
    } catch (err) {
      // 409 = exception métier (places insuffisantes, chevauchement, propre trajet...)
      // 422 = validation (nombre_places invalide)
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.nombre_places?.[0] ||
        'Impossible de réserver ce trajet pour le moment.'
      setErreurReservation(message)
    } finally {
      setEnvoiEnCours(false)
    }
  }

  if (chargement) {
    return (
      <Layout>
        <p className="font-donnee text-sm text-nuit/40 text-center py-16">Chargement…</p>
      </Layout>
    )
  }

  if (erreurChargement) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <p className="text-piment bg-piment-clair rounded-lg px-4 py-3 inline-block">
            {erreurChargement}
          </p>
          <div className="mt-4">
            <Link to="/" className="text-savane font-medium hover:underline">
              ← Retour à la recherche
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const complet = trajet.places_disponibles === 0
  const estSonPropreTrajet = user?.id === trajet.conducteur.id

  return (
    <Layout>
      <div className="max-w-lg mx-auto px-6 py-10">
        <Link to="/" className="text-sm text-nuit/50 hover:text-nuit transition">
          ← Retour à la recherche
        </Link>

        <div className="bg-white rounded-3xl border-2 border-nuit/10 p-6 mt-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-affiche font-semibold text-2xl text-nuit">
              {trajet.ville_depart}
            </span>
            <RouteDivider className="w-14 h-14" />
            <span className="font-affiche font-semibold text-2xl text-nuit">
              {trajet.ville_arrivee}
            </span>
          </div>

          <p className="font-donnee text-xs text-nuit/50 uppercase tracking-wide mb-5">
            {formateurDate.format(new Date(trajet.date_heure_depart))}
          </p>

          <div className="mb-5">
            <CarteTrajet villeDepart={trajet.ville_depart} villeArrivee={trajet.ville_arrivee} />
          </div>

          <div className="flex items-center gap-2.5 mb-5 pb-5 border-b border-nuit/10">
            <div className="w-9 h-9 rounded-full bg-savane-clair flex items-center justify-center text-sm font-semibold text-savane">
              {trajet.conducteur.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-nuit">{trajet.conducteur.name}</p>
              {trajet.conducteur.note_moyenne && (
                <p className="text-xs text-or-fonce">★ {trajet.conducteur.note_moyenne} / 5</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-nuit/50 uppercase tracking-wide">Prix par place</p>
              <p className="font-affiche font-bold text-2xl text-nuit">
                {formateurPrix.format(trajet.prix_par_place)}{' '}
                <span className="text-sm font-normal text-nuit/50">FCFA</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-nuit/50 uppercase tracking-wide">Disponibilité</p>
              <p className={`font-affiche font-bold text-2xl ${complet ? 'text-piment' : 'text-savane'}`}>
                {complet ? 'Complet' : `${trajet.places_disponibles} place${trajet.places_disponibles > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* --- Zone d'action, selon la situation de l'utilisateur --- */}

          {succes ? (
            <div className="bg-savane-clair text-savane rounded-lg px-4 py-3 text-sm font-medium text-center">
              Demande de réservation envoyée ! Le conducteur doit maintenant l'accepter.
            </div>
          ) : !user ? (
            <div className="text-center bg-sable rounded-lg px-4 py-4">
              <p className="text-sm text-nuit/70 mb-2">Connectez-vous pour réserver ce trajet.</p>
              <Link
                to="/connexion"
                className="inline-block bg-or hover:bg-or-fonce text-nuit font-semibold text-sm px-4 py-2 rounded-lg transition"
              >
                Se connecter
              </Link>
            </div>
          ) : estSonPropreTrajet ? (
            <p className="text-sm text-nuit/50 text-center bg-sable rounded-lg px-4 py-3">
              C'est votre propre trajet.
            </p>
          ) : complet ? (
            <p className="text-sm text-piment text-center bg-piment-clair rounded-lg px-4 py-3 font-medium">
              Ce trajet est complet.
            </p>
          ) : (
            <form onSubmit={gererReservation}>
              {erreurReservation && (
                <div className="mb-3 px-3 py-2.5 rounded-lg bg-piment-clair text-piment text-sm font-medium">
                  {erreurReservation}
                </div>
              )}

              <label className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-nuit/70">Nombre de places</span>
                <select
                  value={nombrePlaces}
                  onChange={(e) => setNombrePlaces(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-nuit/15 text-sm focus:outline-none focus:ring-2 focus:ring-or/50 focus:border-or transition"
                >
                  {Array.from(
                    { length: Math.min(trajet.places_disponibles, 8) },
                    (_, i) => i + 1
                  ).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={envoiEnCours}
                className="w-full py-2.5 rounded-lg bg-or hover:bg-or-fonce disabled:opacity-50 text-nuit font-semibold transition"
              >
                {envoiEnCours
                  ? 'Envoi en cours…'
                  : `Réserver — ${formateurPrix.format(trajet.prix_par_place * nombrePlaces)} FCFA`}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}
