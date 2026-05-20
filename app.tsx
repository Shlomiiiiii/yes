import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminShell } from './admin-shell';
import { LoginPage } from './login-page';
import { DashboardPage } from './dashboard-page';
import { PropertiesPage } from './properties-page';
import { ClientsPage } from './clients-page';
import { FinancesPage } from './finances-page';
import { PaymentsPage } from './payments-page';
import { AIPage } from './ai-page';
import { SettingsPage } from './settings-page';
import { GalleryPage } from './gallery-page';
import './styles.css';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/gallery/:slug" element={<GalleryPage />} />
      <Route path="/admin" element={<AdminShell><DashboardPage /></AdminShell>} />
      <Route path="/admin/properties" element={<AdminShell><PropertiesPage /></AdminShell>} />
      <Route path="/admin/clients" element={<AdminShell><ClientsPage /></AdminShell>} />
      <Route path="/admin/finances" element={<AdminShell><FinancesPage /></AdminShell>} />
      <Route path="/admin/payments" element={<AdminShell><PaymentsPage /></AdminShell>} />
      <Route path="/admin/ai" element={<AdminShell><AIPage /></AdminShell>} />
      <Route path="/admin/settings" element={<AdminShell><SettingsPage /></AdminShell>} />
    </Routes>
  );
}
