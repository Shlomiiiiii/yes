import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Topbar } from './topbar';
import { api } from './api';
import { useApi } from './use-api';

const filters = ['All','paid','pending','unpaid','refunded'] as const;

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
    return filtered.filter((r) => r.client?.fullName.toLowerCase().includes(q) || r.prop?.address.toLowerCase().includes(q));
  }, [filter, query, paysQ.data, clientsQ.data, propsQ.data]);
  const total = rows.reduce((acc, r) => acc + (r.status === 'paid' ? r.amount : 0), 0);
  return (
    <div>
      <Topbar title="Payments" subtitle={`${rows.length} transactions · $${total.toLocaleString()} collected`} showSearch={false}
        actions={<div className="search"><input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {filters.map((f) => <button key={f} className="btn" onClick={() => setFilter(f)} style={filter === f ? { borderColor: 'rgba(196,167,102,0.4)', background: 'rgba(196,167,102,0.1)', color: '#c4a766', textTransform: 'capitalize' } : { textTransform: 'capitalize' }}>{f}</button>)}
      </div>
      {paysQ.loading && <div style={{ padding: 40, textAlign: 'center', color: 'rgba(245,243,239,0.5)' }}><Loader2 size={20} /> Loading…</div>}
      {!paysQ.loading && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>Client</th><th>Property</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const cls = r.status === 'paid' ? 'badgePaid' : r.status === 'pending' ? 'badgePending' : 'badgeUnpaid';
                return (
                  <tr key={r.id}>
                    <td><strong style={{ fontWeight: 500 }}>{r.client?.fullName || '—'}</strong></td>
                    <td>{r.prop?.address || '—'}</td>
                    <td style={{ color: '#c4a766' }}>${r.amount.toLocaleString()}</td>
                    <td><span className={`badge ${cls}`}>{r.status}</span></td>
                    <td style={{ color: 'rgba(245,243,239,0.5)' }}>{r.createdAt}</td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(245,243,239,0.4)', padding: 32 }}>No payments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
