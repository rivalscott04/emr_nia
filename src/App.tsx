import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "./components/layout/app-layout"
import DashboardPage from "./modules/dashboard"
import LoginPage from "./modules/auth/login"
import { AuthProvider } from "./modules/auth/auth-context"
import { RequireAuth } from "./modules/auth/require-auth"
import { RequirePermission } from "./modules/auth/require-permission"
import PasienPage from "./modules/pasien"
import PasienCreatePage from "./modules/pasien/create"
import PasienDetailPage from "./modules/pasien/detail"
import KunjunganPage from "./modules/kunjungan"
import KunjunganCreatePage from "./modules/kunjungan/create"
import KunjunganDetailPage from "./modules/kunjungan/detail"
import RekamMedisListPage from "./modules/rekam-medis"
import RekamMedisDetailPage from "./modules/rekam-medis/detail"
import TindakanPage from "./modules/tindakan"
import ResepPage from "./modules/resep"
import AntrianResepPage from "./modules/farmasi/antrian-resep"
import RiwayatPenyerahanPage from "./modules/farmasi/riwayat-penyerahan"
import SuperadminPage from "./modules/superadmin"
import SuperadminRolePoliPage from "./modules/superadmin/roles-poli"
import SuperadminAuditPage from "./modules/superadmin/audit"
import SuperadminMasterIcdPage from "./modules/superadmin/master-icd"
import SuperadminDaftarObatPage from "./modules/superadmin/daftar-obat"
import SuperadminSyncObatPage from "./modules/superadmin/sync-obat"
import SuperadminInfoKlinikPage from "./modules/superadmin/info-klinik"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<RequireAuth />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<RequirePermission permission="dashboard.view"><DashboardPage /></RequirePermission>} />

                <Route path="/pasien" element={<RequirePermission permission="pasien.read"><PasienPage /></RequirePermission>} />
                <Route path="/pasien/new" element={<RequirePermission permission="pasien.write"><PasienCreatePage /></RequirePermission>} />
                <Route path="/pasien/:id" element={<RequirePermission permission="pasien.read"><PasienDetailPage /></RequirePermission>} />

                <Route path="/kunjungan" element={<RequirePermission permission="kunjungan.read"><KunjunganPage /></RequirePermission>} />
                <Route path="/kunjungan/create" element={<RequirePermission permission="kunjungan.write"><KunjunganCreatePage /></RequirePermission>} />
                <Route path="/kunjungan/:id" element={<RequirePermission permission="kunjungan.read"><KunjunganDetailPage /></RequirePermission>} />

                <Route path="/rekam-medis" element={<RequirePermission permission="rekam_medis.read"><RekamMedisListPage /></RequirePermission>} />
                <Route path="/rekam-medis/:kunjunganId" element={<RequirePermission permission="rekam_medis.read"><RekamMedisDetailPage /></RequirePermission>} />

                <Route path="/tindakan" element={<RequirePermission permission="rekam_medis.read"><TindakanPage /></RequirePermission>} />
                <Route path="/resep" element={<RequirePermission permission="rekam_medis.read"><ResepPage /></RequirePermission>} />
                <Route path="/farmasi/resep" element={<RequirePermission permission="resep.process"><AntrianResepPage /></RequirePermission>} />
                <Route path="/farmasi/riwayat" element={<RequirePermission permission="resep.process"><RiwayatPenyerahanPage /></RequirePermission>} />

                <Route path="/superadmin" element={<Navigate to="/superadmin/access" replace />} />
                <Route
                  path="/superadmin/access"
                  element={<RequirePermission permission="user_access.manage"><SuperadminPage /></RequirePermission>}
                />
                <Route
                  path="/superadmin/roles-poli"
                  element={<RequirePermission permission="role_poli.manage"><SuperadminRolePoliPage /></RequirePermission>}
                />
                <Route
                  path="/superadmin/audit"
                  element={<RequirePermission permission="audit_log.read"><SuperadminAuditPage /></RequirePermission>}
                />
                <Route
                  path="/superadmin/master-icd"
                  element={<RequirePermission permission="master_icd.manage"><SuperadminMasterIcdPage /></RequirePermission>}
                />
                <Route
                  path="/superadmin/daftar-obat"
                  element={<RequirePermission permission="obat_sync.manage"><SuperadminDaftarObatPage /></RequirePermission>}
                />
                <Route
                  path="/superadmin/sync-obat"
                  element={<RequirePermission permission="obat_sync.manage"><SuperadminSyncObatPage /></RequirePermission>}
                />
                <Route
                  path="/superadmin/info-klinik"
                  element={<RequirePermission permission="settings.manage"><SuperadminInfoKlinikPage /></RequirePermission>}
                />

                <Route path="/settings" element={<Navigate to="/superadmin/info-klinik" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
