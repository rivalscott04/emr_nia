import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "./components/layout/app-layout"
import DashboardPage from "./modules/dashboard"
import LoginPage from "./modules/auth/login"
import PasienPage from "./modules/pasien"
import PasienCreatePage from "./modules/pasien/create"
import PasienDetailPage from "./modules/pasien/detail"
import KunjunganPage from "./modules/kunjungan"
import KunjunganCreatePage from "./modules/kunjungan/create"
import RekamMedisListPage from "./modules/rekam-medis"
import RekamMedisDetailPage from "./modules/rekam-medis/detail"
import TindakanPage from "./modules/tindakan"
import ResepPage from "./modules/resep"
import SettingsPage from "./modules/settings"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/pasien" element={<PasienPage />} />
            <Route path="/pasien/new" element={<PasienCreatePage />} />
            <Route path="/pasien/:id" element={<PasienDetailPage />} />

            <Route path="/kunjungan" element={<KunjunganPage />} />
            <Route path="/kunjungan/create" element={<KunjunganCreatePage />} />

            <Route path="/rekam-medis" element={<RekamMedisListPage />} />
            <Route path="/rekam-medis/:kunjunganId" element={<RekamMedisDetailPage />} />

            <Route path="/tindakan" element={<TindakanPage />} />
            <Route path="/resep" element={<ResepPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
