import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TripsPage from './pages/TripsPage'
import TripDetailPage from './pages/TripDetailPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes publiques (EF-04 : le visiteur peut consulter/rechercher) */}
        <Route path="/" element={<TripsPage />} />
        <Route path="/trajets/:id" element={<TripDetailPage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />

        {/* Route protégée */}
        <Route
          path="/tableau-de-bord"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
