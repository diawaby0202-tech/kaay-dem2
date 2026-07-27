import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

export default function Layout({ children }) {
  const { user, deconnexion } = useAuth()
  const navigate = useNavigate()

  async function gererDeconnexion() {
    await deconnexion()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-sable">
      <header className="bg-or px-6 py-4 flex items-center justify-between shadow-md">
        <Link to="/" className="font-affiche text-2xl font-bold text-white drop-shadow-sm">
          Kaay Dem !
        </Link>

        <nav className="flex items-center gap-5">
          <Link to="/" className="text-sm text-white/85 hover:text-white transition font-semibold">
            Trajets
          </Link>

          {user ? (
            <>
              <NotificationBell />
              <Link
                to="/tableau-de-bord"
                className="text-sm text-white/85 hover:text-white transition font-semibold"
              >
                Mon espace
              </Link>
              {user.is_admin && (
                <Link
                  to="/admin"
                  className="text-sm text-white/85 hover:text-white transition font-semibold"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={gererDeconnexion}
                className="text-sm bg-nuit/20 hover:bg-nuit/30 text-white px-3.5 py-1.5 rounded-full transition font-semibold"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link
                to="/connexion"
                className="text-sm text-white/85 hover:text-white transition font-semibold"
              >
                Se connecter
              </Link>
              <Link
                to="/inscription"
                className="text-sm bg-nuit hover:bg-nuit-clair text-white px-4 py-1.5 rounded-full transition font-bold shadow-sm"
              >
                S'inscrire
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>{children}</main>
    </div>
  )
}
