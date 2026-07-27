import { useEffect, useState, useCallback } from 'react'
import { rechercherTrajets } from '../api/trips'
import Layout from '../components/Layout'
import TripCard from '../components/TripCard'
import { Flag, MapPin } from 'lucide-react'

export default function TripsPage() {
  const [filtres, setFiltres] = useState({
    ville_depart: '',
    ville_arrivee: '',
    date: '',
    prix_max: '',
  })
  const [trajets, setTrajets] = useState([])
  const [pagination, setPagination] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  const lancerRecherche = useCallback((filtresActuels, page = 1) => {
    setChargement(true)
    setErreur(null)

    rechercherTrajets({ ...filtresActuels, page })
      .then((res) => {
        setTrajets(res.data.data)
        setPagination(res.data.meta)
      })
      .catch(() => setErreur('Impossible de charger les trajets pour le moment.'))
      .finally(() => setChargement(false))
  }, [])

  // Recherche initiale au chargement de la page (sans filtre)
  useEffect(() => {
    lancerRecherche(filtres)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function gererSoumission(e) {
    e.preventDefault()
    lancerRecherche(filtres)
  }

  function gererChangementFiltre(e) {
    const { name, value } = e.target
    // Nettoie les espaces qu'un navigateur peut insérer (formatage des
    // milliers en locale fr-FR) pour éviter que le champ "number" les rejette
    const valeurNettoyee = name === 'prix_max' ? value.replace(/\s/g, '') : value
    setFiltres({ ...filtres, [name]: valeurNettoyee })
  }

  function changerPage(page) {
    lancerRecherche(filtres, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Layout>
      {/* Section hero : dégradé graphique + formes décoratives (plus de photo stock) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-or via-or-fonce to-piment">
        {/* Formes décoratives */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white/10" aria-hidden="true" />

        <div className="relative max-w-3xl mx-auto px-6 pt-14 pb-20 text-center">
          <h1 className="font-affiche text-5xl font-extrabold text-white mb-2 drop-shadow-sm">
            Trouvez votre trajet
          </h1>
          <p className="text-white/90 font-medium mb-8">
            Dakar, Rufisque, Diamniadio et les campus environnants.
          </p>
        </div>

        {/* Formulaire de recherche : carte flottante qui chevauche la hero */}
        <form
          onSubmit={gererSoumission}
          className="relative max-w-3xl mx-auto px-6 -mt-12 mb-0"
        >
          <div className="bg-white rounded-3xl border-2 border-nuit/5 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 shadow-2xl">
            <label className="col-span-1 relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-or-fonce" strokeWidth={2.5} />
              <input
                name="ville_depart"
                value={filtres.ville_depart}
                onChange={gererChangementFiltre}
                placeholder="Départ"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border-2 border-sable-fonce text-sm font-medium focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
              />
            </label>
            <label className="col-span-1 relative">
              <Flag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-savane" strokeWidth={2.5} />
              <input
                name="ville_arrivee"
                value={filtres.ville_arrivee}
                onChange={gererChangementFiltre}
                placeholder="Arrivée"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border-2 border-sable-fonce text-sm font-medium focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
              />
            </label>
            <input
              type="date"
              name="date"
              value={filtres.date}
              onChange={gererChangementFiltre}
              className="col-span-1 px-3 py-2.5 rounded-xl border-2 border-sable-fonce text-sm font-medium focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
            />
            <input
              type="number"
              name="prix_max"
              value={filtres.prix_max}
              onChange={gererChangementFiltre}
              placeholder="Prix max (FCFA)"
              className="col-span-1 px-3 py-2.5 rounded-xl border-2 border-sable-fonce text-sm font-medium focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or transition"
            />

            <button
              type="submit"
              className="col-span-2 sm:col-span-4 py-3 rounded-xl bg-nuit hover:bg-nuit-clair text-white font-affiche font-bold text-base transition shadow-lg"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-10 pb-10">
        {chargement && (
          <p className="font-donnee text-sm text-nuit/40 text-center py-10">Chargement…</p>
        )}

        {erreur && (
          <p className="text-sm text-piment bg-piment-clair rounded-xl px-4 py-3 text-center font-medium">
            {erreur}
          </p>
        )}

        {!chargement && !erreur && trajets.length === 0 && (
          <p className="text-sm text-nuit/50 text-center py-10">
            Aucun trajet ne correspond à votre recherche.
          </p>
        )}

        {!chargement && trajets.length > 0 && (
          <div className="space-y-4">
            {trajets.map((trajet) => (
              <TripCard key={trajet.id} trajet={trajet} />
            ))}
          </div>
        )}

        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => changerPage(page)}
                className={`w-9 h-9 rounded-full text-sm font-bold transition ${
                  page === pagination.current_page
                    ? 'bg-or text-white shadow-md'
                    : 'bg-white text-nuit/60 hover:bg-sable-fonce border-2 border-nuit/10'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
