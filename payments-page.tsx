import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Topbar } from '../topbar';
import { api } from '../api';
import { useApi } from '../use-api';
import styles from '../styles.module.css';

const filters = ['All', 'paid', 'pending', 'unpaid', 'refunded'] as const;

export function PaymentsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [query, setQuery] = useState('');
  const paysQ = useApi(() => api.payments.list(), []);
  const clientsQ = useApi(() => api.clients.list(), []);
  const propsQ = useApi(() => api.properties.list(), []);
  const rows = useMemo(() => {
    const list = (paysQ.data || []).map((p) => {
      const client = (clientsQ.data || []).find((c) => c.id === p.clientId);
      const prop = (propsQ.data || []).find((pr) => pr.id === p.propertyId);
      return { ...p, client, prop };
    });
    const filtered = filter === 'All' ? list : list.filter((r) => r.status === filter);
    const q = query.toLowerCase().trim();
    if (!q) return filtered;
    return filtered.filter(
      (r) =>
        r.client?.fullName.toLowerCase().includes(q) ||
        r.prop?.address.toLowerCase().includes(q) ||
        r.prop?.city.toLowerCase().includes(q),
    );
  }, [filter, query, paysQ.data, clientsQ.data, propsQ.data]);
  const total = rows.reduce((acc, r) => acc + (r.status === 'paid' ? r.amount : 0), 0);
  return (
    <div>
      <Topbar
        title="Payments"
        subtitle={`${rows.length} transactions · $${total.toLocaleString()} collected`}
        showSearch={false}
        actions={
          <div className={styles.search}>
            <input
              placeholder="Search by client or address…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        }
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button
            key={f}
            className={styles.btn}
            onClick={() => setFilter(f)}
            style={
              filter === f
                ? {
                    borderColor: 'rgba(196,167,102,0.4)',
                    background: 'rgba(196,167,102,0.1)',
                    color: '#c4a766',
                    textTransform: 'capitalize',
                  }
                : { textTransform: 'capitalize' }
            }
          >
            {f}
          </button>
        ))}
      </div>
      {paysQ.loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(245,243,239,0.5)' }}>
          <Loader2 size={20} /> Loading…
        </div>
      )}
      {!paysQ.loading && (
        <motion.div
          className={styles.card}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ overflowX: 'auto' }}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Property</th>
                <th>City</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const badgeCls =
                  r.status === 'paid'
                    ? styles.badgePaid
                    : r.status === 'pending'
                      ? styles.badgePending
                      : styles.badgeUnpaid;
                return (
                  <tr key={r.id}>
                    <td>
                      <strong style={{ fontWeight: 500 }}>{r.client?.fullName || '—'}</strong>
                      <div style={{ fontSize: 11, color: 'rgba(245,243,239,0.45)' }}>
                        {r.clientEmail}
                      </div>
                    </td>
                    <td>{r.prop?.address || '—'}</td>
                    <td>
                      {r.prop?.city}
                      {r.prop?.state ? `, ${r.prop.state}` : ''}
                    </td>
                    <td style={{ color: '#c4a766' }}>${r.amount.toLocaleString()}</td>
                    <td>
                      <span className={`${styles.badge} ${badgeCls}`}>{r.status}</span>
                    </td>
                    <td style={{ color: 'rgba(245,243,239,0.5)' }}>{r.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
