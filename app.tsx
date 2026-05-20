import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminShell } from './admin-shell';
import { LoginPage } from './pages/login-page';
import { DashboardPage } from './pages/dashboard-page';
import { PropertiesPage } from './pages/properties-page';
import { ClientsPage } from './pages/clients-page';
import { FinancesPage } from './pages/finances-page';
import { PaymentsPage } from './pages/payments-page';
import { AIPage } from './pages/ai-page';
import { SettingsPage } from './pages/settings-page';
import { GalleryPage } from './pages/gallery-page';
import styles from './styles.module.css';

export function App() {
  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/gallery/:slug" element={<GalleryPage />} />
        <Route
          path="/admin"
          element={
            <AdminShell>
              <DashboardPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/properties"
          element={
            <AdminShell>
              <PropertiesPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <AdminShell>
              <ClientsPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/finances"
          element={
            <AdminShell>
              <FinancesPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminShell>
              <PaymentsPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/ai"
          element={
            <AdminShell>
              <AIPage />
            </AdminShell>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminShell>
              <SettingsPage />
            </AdminShell>
          }
        />
      </Routes>
    </div>
  );
}
