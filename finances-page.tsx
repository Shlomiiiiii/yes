import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { Topbar } from '../topbar';
import { api } from '../api';
import { useApi } from '../use-api';
import styles from '../styles.module.css';

const goldShades = ['#c4a766', '#9c8146', '#d4b876', '#7a653a', '#e8c47a'];

export function FinancesPage() {
  const summaryQ = useApi(() => api.finances.summary(), []);
  const revQ = useApi(() => api.finances.revenueOverTime(), []);
  const cityQ = useApi(() => api.finances.revenueByCity(), []);
  const topQ = useApi(() => api.finances.topClients(), []);
  const summary = summaryQ.data;
  const stats = [
    { label: 'Total Revenue', value: summary ? `$${summary.totalRevenue.toLocaleString()}` : '—' },
    {
      label: 'Monthly Revenue',
      value: summary ? `$${summary.monthlyRevenue.toLocaleString()}` : '—',
    },
    { label: 'Weekly Revenue', value: summary ? `$${summary.weeklyRevenue.toLocaleString()}` : '—' },
    { label: 'Pending', value: summary ? `$${summary.pendingRevenue.toLocaleString()}` : '—' },
    { label: 'Paid Galleries', value: summary ? String(summary.paidGalleries) : '—' },
    { label: 'Avg Sale', value: summary ? `$${summary.averageSale.toLocaleString()}` : '—' },
    {
      label: 'Growth',
      value: summary
        ? `${summary.growthPercent >= 0 ? '+' : ''}${summary.growthPercent}%`
        : '—',
    },
    { label: 'Galleries Sold', value: summary ? String(summary.galleriesSold) : '—' },
  ];
  if (summaryQ.loading) {
    return (
      <div>
        <Topbar title="Finances" subtitle="Revenue, payments & forecasting" showSearch={false} />
        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(245,243,239,0.5)' }}>
          <Loader2 size={20} /> Loading…
        </div>
      </div>
    );
  }
  return (
    <div>
      <Topbar title="Finances" subtitle="Revenue, payments & forecasting" showSearch={false} />
      <div className={styles.statsGrid}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className={styles.card}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          >
            <p className={styles.statLabel}>{s.label}</p>
            <p className={styles.statValue}>{s.value}</p>
          </motion.div>
        ))}
      </div>
      <div className={`${styles.row} ${styles.col2}`}>
        <div className={styles.card}>
          <p className={styles.statLabel}>Revenue Trend</p>
          <p className={styles.statValue} style={{ fontSize: 22 }}>
            ${summary?.totalRevenue.toLocaleString() || 0}
            {summary && summary.growthPercent !== 0 && (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 12,
                  color: summary.growthPercent >= 0 ? '#8ed7a8' : '#e88a7a',
                }}
              >
                <TrendingUp size={13} /> {summary.growthPercent >= 0 ? '+' : ''}
                {summary.growthPercent}%
              </span>
            )}
          </p>
          <div style={{ width: '100%', height: 280, marginTop: 16 }}>
            <ResponsiveContainer>
              <AreaChart data={revQ.data || []}>
                <defs>
                  <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c4a766" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#c4a766" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(245,243,239,0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="rgba(245,243,239,0.4)" fontSize={12} />
                <YAxis stroke="rgba(245,243,239,0.4)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#15151a',
                    border: '1px solid rgba(245,243,239,0.1)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c4a766"
                  strokeWidth={2.5}
                  fill="url(#areaGold)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={styles.card}>
          <p className={styles.statLabel}>Revenue by City</p>
          {(cityQ.data || []).length === 0 ? (
            <div style={{ padding: 30, color: 'rgba(245,243,239,0.5)', fontSize: 13 }}>
              No paid galleries yet.
            </div>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={cityQ.data || []}
                    dataKey="revenue"
                    nameKey="city"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {(cityQ.data || []).map((_, idx) => (
                      <Cell key={idx} fill={goldShades[idx % goldShades.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#15151a',
                      border: '1px solid rgba(245,243,239,0.1)',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(245,243,239,0.7)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      <div className={styles.card} style={{ marginTop: 18 }}>
        <p className={styles.statLabel}>Top Paying Clients</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Galleries</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(topQ.data || []).map((c) => (
              <tr key={c.clientId}>
                <td>
                  <strong style={{ fontWeight: 500 }}>{c.fullName}</strong>
                </td>
                <td>{c.galleries}</td>
                <td style={{ color: '#c4a766' }}>${c.totalSpent.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
