import { useEffect, useState } from 'react';
import { Check, X as XIcon, AlertCircle } from 'lucide-react';
import { Topbar } from '../topbar';
import { useAuth } from '../auth-context';
import { api } from '../api';
import styles from '../styles.module.css';

type Status = {
  store: 'memory' | 'firestore';
  firebase: boolean;
  firebaseError: string | null;
  gemini: boolean;
  stripe: boolean;
  stripeWebhook: boolean;
};

const envs = [
  { name: 'GEMINI_API_KEY', purpose: 'Google Gemini AI', check: (s: Status) => s.gemini },
  { name: 'STRIPE_SECRET_KEY', purpose: 'Stripe Checkout', check: (s: Status) => s.stripe },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    purpose: 'Stripe webhooks',
    check: (s: Status) => s.stripeWebhook,
  },
  {
    name: 'FIREBASE_SERVICE_ACCOUNT',
    purpose: 'Firestore persistence',
    check: (s: Status) => s.firebase,
  },
];

export function SettingsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    api.status().then(setStatus).catch(() => setStatus(null));
  }, []);
  return (
    <div>
      <Topbar title="Settings" subtitle="Account & integrations" showSearch={false} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 18,
        }}
      >
        <div className={styles.card}>
          <p className={styles.statLabel}>Admin</p>
          <p style={{ margin: '6px 0', fontSize: 14 }}>
            {user?.email || 'solophotography@icloud.com'}
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.statLabel}>Backend</p>
          <p style={{ margin: '6px 0', fontSize: 13 }}>{api.backendUrl}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.statLabel}>Data Store</p>
          <p style={{ margin: '6px 0', fontSize: 14, textTransform: 'capitalize' }}>
            {status?.store || '—'}
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.statLabel}>AI</p>
          <p style={{ margin: '6px 0', fontSize: 14 }}>
            {status?.gemini ? 'Google Gemini ✓' : 'Demo replies'}
          </p>
        </div>
      </div>
      {status?.firebaseError && !status.firebase && (
        <div
          className={styles.card}
          style={{
            marginTop: 22,
            border: '1px solid rgba(232,196,122,0.3)',
            background: 'rgba(232,196,122,0.06)',
            color: '#e8c47a',
            display: 'flex',
            gap: 12,
          }}
        >
          <AlertCircle size={18} />
          <div>
            <strong>Firebase</strong> — {status.firebaseError}
          </div>
        </div>
      )}
      <div className={styles.card} style={{ marginTop: 22 }}>
        <p className={styles.statLabel}>Environment Variables</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Variable</th>
              <th>Purpose</th>
              <th style={{ textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {envs.map((e) => {
              const set = status ? e.check(status) : false;
              return (
                <tr key={e.name}>
                  <td style={{ fontFamily: 'monospace', color: '#c4a766' }}>{e.name}</td>
                  <td style={{ color: 'rgba(245,243,239,0.7)' }}>{e.purpose}</td>
                  <td style={{ textAlign: 'right' }}>
                    {set ? (
                      <span
                        style={{
                          color: '#8ed7a8',
                          display: 'inline-flex',
                          gap: 4,
                          alignItems: 'center',
                          fontSize: 12,
                        }}
                      >
                        <Check size={13} /> Set
                      </span>
                    ) : (
                      <span
                        style={{
                          color: 'rgba(245,243,239,0.4)',
                          display: 'inline-flex',
                          gap: 4,
                          alignItems: 'center',
                          fontSize: 12,
                        }}
                      >
                        <XIcon size={13} /> Not set
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
