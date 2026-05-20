import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { ArrowUpRight, Plus, Activity, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Topbar } from './topbar';
import { api } from './api';
import { useApi } from './use-api';

export function DashboardPage() {
  const summaryQ = useApi(() => api.finances.summary(), []);
  const revQ = useApi(() => api.finances.revenueOverTime(), []);
  const cityQ = useApi(() => api.finances.revenueByCity(), []);
  const propsQ = useApi(() => api.properties.list(), []);
  const paysQ = useApi(() => api.payments.list(), []);
  const clientsQ = useApi(() => api.clients.list(), []);
  const summary = summaryQ.data;
  const stats = [
    { label: 'Total Revenue', value: summary ? `$${summary.totalRevenue.toLocaleString()}` : '—', delta: summary ? `${summary.growthPercent >= 0 ? '+' : ''}${summary.growthPercent}% MoM` : '' },
    { label: 'Galleries Sold', value: summary ? String(summary.galleriesSold) : '—' },
    { label: 'Average Sale', value: summary ? `$${summary.averageSale.toLocaleString()}` : '—' },
    { label: 'Pending Payments', value: summary ? `$${summary.pendingRevenue.toLocaleString()}` : '—' },
  ];
  const recent = (paysQ.data || []).slice(0, 5).map((p) => {
    const client = (clientsQ.data || []).find((c) => c.id === p.clientId);
    const prop = (propsQ.data || []).find((pr) => pr.id === p.propertyId);
    return { id: p.id, text: `${p.status === 'paid' ? '✓' : '•'} ${client?.fullName || 'Client'} — ${prop?.address || 'Property'} ($${p.amount.toLocaleString()})`, date: p.createdAt };
  });
  if (summaryQ.loading) return <div><Topbar title="Dashboard" subtitle="Welcome back, Shlomi" /><div style={{ padding: 40, textAlign: 'center', color: 'rgba(245,243,239,0.5)' }}><Loader2 size={20} /> Loading…</div></div>;
  return (
    <div>
      <Topbar title="Dashboard" subtitle="Welcome back, Shlomi" actions={<Link to="/admin/properties" className="btn btnGold"><Plus size={14} /> New Gallery</Link>} />
      <div className="statsGrid">
        {stats.map((s, i) => (
          <motion.div key={s.label} className="card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <p className="statLabel">{s.label}</p>
            <p className="statValue">{s.value}</p>
            {s.delta && <span className="statDelta"><ArrowUpRight size={12} /> {s.delta}</span>}
          </motion.div>
        ))}
      </div>
      <div className="row col2">
        <div className="card">
          <p className="statLabel">Revenue Over Time</p>
          <div style={{ width: '100%', height: 240, marginTop: 12 }}>
            <ResponsiveContainer>
              <LineChart data={revQ.data || []}>
                <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#c4a766" /><stop offset="100%" stopColor="#e8c47a" /></linearGradient></defs>
                <CartesianGrid stroke="rgba(245,243,239,0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="rgba(245,243,239,0.4)" fontSize={12} />
                <YAxis stroke="rgba(245,243,239,0.4)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#15151a', border: '1px solid rgba(245,243,239,0.1)', borderRadius: 10 }} />
                <Line type="monotone" dataKey="revenue" stroke="url(#g1)" strokeWidth={2.5} dot={{ fill: '#c4a766', strokeWidth: 0, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <p className="statLabel"><Activity size={11} style={{ display: 'inline', marginRight: 6 }} />Recent Activity</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recent.map((a) => <li key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(245,243,239,0.04)', fontSize: 13 }}>{a.text}</li>)}
            {!recent.length && <li style={{ padding: '12px 0', color: 'rgba(245,243,239,0.5)' }}>No activity yet.</li>}
          </ul>
        </div>
      </div>
      <div className="row col2" style={{ marginTop: 18 }}>
        <div className="card">
          <p className="statLabel">Most Profitable Cities</p>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={cityQ.data || []}>
                <CartesianGrid stroke="rgba(245,243,239,0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="city" stroke="rgba(245,243,239,0.4)" fontSize={12} />
                <YAxis stroke="rgba(245,243,239,0.4)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#15151a', border: '1px solid rgba(245,243,239,0.1)', borderRadius: 10 }} />
                <Bar dataKey="revenue" fill="#c4a766" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <p className="statLabel">Latest Properties</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {(propsQ.data || []).slice(0, 4).map((p) => (
              <li key={p.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(245,243,239,0.04)', alignItems: 'center' }}>
                <img src={p.coverImage} alt="" style={{ width: 56, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{p.address}</div><div style={{ fontSize: 11, color: 'rgba(245,243,239,0.5)' }}>{p.city}, {p.state}</div></div>
                <div style={{ fontSize: 13, color: '#c4a766' }}>${p.price.toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
