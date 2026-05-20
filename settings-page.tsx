import { useEffect, useState } from 'react';
import { Topbar } from './topbar';
import { useAuth } from './auth-context';
import { api } from './api';

export function SettingsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<any>(null);
  useEffect(() => { api.status().then(setStatus).catch(() => setStatus(null)); }, []);
  const envs = [
    { name: 'GEMINI_API_KEY', purpose: 'Google Gemini AI', ok: status?.gemini },
    { name: 'STRIPE_SECRET_KEY', purpose: 'Stripe Checkout', ok: status?.stripe },
    { name: 'STRIPE_WEBHOOK_SECRET', purpose: 'Stripe webhooks', ok: status?.stripeWebhook },
    { name: 'FIREBASE_SERVICE_ACCOUNT', purpose: 'Firestore persistence', ok: status?.firebase },
  ];
  return (
    <div>
      <Topbar title="Settings" subtitle="Account & integrations" showSearch={false} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        <div className="card"><p className="statLabel">Admin</p><p style={{ margin: '6px 0', fontSize: 14 }}>{user?.email}</p></div>
        <div className="card"><p className="statLabel">Backend</p><p style={{ margin: '6px 0', fontSize: 13 }}>{api.backendUrl}</p></div>
        <div className="card"><p className="statLabel">Data Store</p><p style={{ margin: '6px 0', fontSize: 14, textTransform: 'capitalize' }}>{status?.store || '—'}</p></div>
        <div className="card"><p className="statLabel">AI</p><p style={{ margin: '6px 0', fontSize: 14 }}>{status?.gemini ? 'Google Gemini ✓' : 'Demo replies'}</p></div>
      </div>
      <div className="card" style={{ marginTop: 22 }}>
        <p className="statLabel">Integrations</p>
        <table className="table">
          <thead><tr><th>Service</th><th>Purpose</th><th style={{ textAlign: 'right' }}>Status</th></tr></thead>
          <tbody>
            {envs.map((e) => (
              <tr key={e.name}>
                <td style={{ fontFamily: 'monospace', color: '#c4a766' }}>{e.name}</td>
                <td style={{ color: 'rgba(245,243,239,0.7)' }}>{e.purpose}</td>
                <td style={{ textAlign: 'right', color: e.ok ? '#8ed7a8' : 'rgba(245,243,239,0.4)' }}>{e.ok ? '✓ Set' : '✗ Not set'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
