import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';
import { Topbar } from './topbar';
import { api } from './api';
import { useApi } from './use-api';

const gold = ['#c4a766','#9c8146','#d4b876','#7a653a','#e8c47a'];

export function FinancesPage() {
  const summaryQ = useApi(() => api.finances.summary(), []);
  const revQ = useApi(() => api.finances.revenueOverTime(), []);
  const cityQ = useApi(() => api.finances.revenueByCity(), []);
  const topQ = useApi(() => api.finances.topClients(), []);
  const s = summaryQ.data;
  const stats = [
    { label: 'Total Revenue', value: s ? `$${s.totalRevenue.toLocaleString()}` : '—' },
    { label: 'Monthly Revenue', value: s ? `$${s.monthlyRevenue.toLocaleString()}` : '—' },
    { label: 'Weekly Revenue', value: s ? `$${s.weeklyRevenue.toLocaleString()}` : '—' },
    { label: 'Pending', value: s ? `$${s.pendingRevenue.toLocaleString()}` : '—' },
    { label: 'Paid Galleries', value: s ? String(s.paidGalleries) : '—' },
    { label: 'Avg Sale', value: s ? `$${s.averageSale.toLocaleString()}` : '—' },
    { label: 'Growth', value: s ? `${s.growthPercent >= 0 ? '+' : ''}${s.growthPercent}%` : '—' },
    { label: 'Galleries Sold', value: s ? String(s.galleriesSold) : '—' },
  ];
  if (summaryQ.loading) return <div><Topbar title="Finances" showSearch={false} /><div style={{ padding: 40, textAlign: 'center', color: 'rgba(245,243,239,0.5)' }}><Loader2 size={20} /> Loading…</div></div>;
  return (
    <div>
      <Topbar title="Finances" subtitle="Revenue, payments & forecasting" showSearch={false} />
      <div className="statsGrid">{stats.map((st) => <div key={st.label} className="card"><p className="statLabel">{st.label}</p><p className="statValue">{st.value}</p></div>)}</div>
      <div className="row col2">
        <div className="card">
          <p className="statLabel">Revenue Trend</p>
          <div style={{ width: '100%', height: 280, marginTop: 12 }}>
            <ResponsiveContainer>
              <AreaChart data={revQ.data || []}>
                <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c4a766" stopOpacity={0.5} /><stop offset="100%" stopColor="#c4a766" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="rgba(245,243,239,0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="rgba(245,243,239,0.4)" fontSize={12} />
                <YAxis stroke="rgba(245,243,239,0.4)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#15151a', border: '1px solid rgba(245,243,239,0.1)', borderRadius: 10 }} />
                <Area type="monotone" dataKey="revenue" stroke="#c4a766" strokeWidth={2.5} fill="url(#ag)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <p className="statLabel">Revenue by City</p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={cityQ.data || []} dataKey="revenue" nameKey="city" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {(cityQ.data || []).map((_, i) => <Cell key={i} fill={gold[i % gold.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#15151a', border: '1px solid rgba(245,243,239,0.1)', borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(245,243,239,0.7)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <p className="statLabel">Top Paying Clients</p>
        <table className="table">
          <thead><tr><th>Client</th><th>Galleries</th><th>Revenue</th></tr></thead>
          <tbody>{(topQ.data || []).map((c) => <tr key={c.clientId}><td><strong style={{ fontWeight: 500 }}>{c.fullName}</strong></td><td>{c.galleries}</td><td style={{ color: '#c4a766' }}>${c.totalSpent.toLocaleString()}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
