import { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'
import { obtenirTransactions } from '../api/wallet'

const formateurPrix = new Intl.NumberFormat('fr-FR')
const formateurDate = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * Section "Portefeuille" (exigence bonus : paiement simulé) : affiche le
 * solde courant de l'utilisateur et l'historique des débits/crédits liés
 * à ses réservations.
 */
export default function WalletSection({ solde }) {
  const [transactions, setTransactions] = useState([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    obtenirTransactions()
      .then((res) => setTransactions(res.data.data))
      .finally(() => setChargement(false))
  }, [])

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-savane-clair flex items-center justify-center shrink-0">
          <Wallet size={16} className="text-savane" strokeWidth={2.5} />
        </div>
        <h3 className="font-affiche font-bold text-lg text-nuit">Portefeuille</h3>
      </div>

      <div className="bg-gradient-to-br from-nuit to-nuit-clair rounded-2xl p-5 mb-3">
        <p className="text-xs text-white/50 uppercase tracking-wide font-semibold">Solde disponible</p>
        <p className="font-affiche font-extrabold text-3xl text-white mt-1">
          {formateurPrix.format(solde ?? 0)}
          <span className="text-sm font-normal text-white/60 ml-1.5">FCFA</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl border-2 border-nuit/10 p-4">
        <p className="text-xs font-bold text-nuit/50 uppercase tracking-wide mb-2">Historique</p>

        {chargement && (
          <p className="font-donnee text-xs text-nuit/40 text-center py-4">Chargement…</p>
        )}

        {!chargement && transactions.length === 0 && (
          <p className="text-sm text-nuit/40 text-center py-4">Aucune transaction pour l'instant.</p>
        )}

        <div className="space-y-2">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-nuit truncate">{t.description}</p>
                <p className="font-donnee text-[11px] text-nuit/40">
                  {formateurDate.format(new Date(t.created_at))}
                </p>
              </div>
              <span
                className={`font-donnee text-sm font-semibold shrink-0 ${
                  t.type === 'credit' ? 'text-savane' : 'text-piment'
                }`}
              >
                {t.type === 'credit' ? '+' : '−'}
                {formateurPrix.format(t.montant)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
